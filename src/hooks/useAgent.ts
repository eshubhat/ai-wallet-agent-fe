import { useState, useEffect, useRef } from 'react';
import { type AgentMessage } from '../types';
import { aiService } from '../services/ai.service';
import { solanaService } from '../services/solana.service';
import { jupiterService } from '../services/jupiter.service';
import { stakingService } from '../services/staking.service';
import { stakeService } from '../services/stake.service';
import { transactionService } from '../services/transaction.service';
import { useSolana } from './useSolana';
import { useAuth } from '../contexts/AuthContext';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { resolveMentions } from '../utils/resolveMentions';

const TOKENS: Record<string, string> = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

const DEFAULT_VALIDATOR = '7AETLyAGJWjp6AWzZqZcP362yv5LQ3nLEdwnXNjdNwwF';

const DEFAULT_MESSAGE: AgentMessage = {
    id: 'default-1',
    role: 'agent',
    content: "Hi! I'm your Solana AI Agent. I can help you transfer SOL, swap tokens, stake, or check your balance. What would you like to do?",
    timestamp: Date.now()
};

// ─── Staking conversation state ──────────────────────────────────────────────
type StakeStep = 'ask_validator_mode'   // waiting for: "auto" or "custom"
    | 'ask_validator_key';   // waiting for the validator address

interface PendingStake {
    step: StakeStep;
    amount: number;
    validatorKey?: string;   // filled in after user provides custom key
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function looksLikeAutoChoice(text: string): boolean {
    const t = text.toLowerCase().trim();
    return (
        t === 'auto' || t === 'automatic' || t === 'automatically' ||
        t.includes('auto') || t.includes('choose for me') ||
        t.includes('you choose') || t.includes('default') ||
        t.includes('let you') || t.includes('pick for me') ||
        t.startsWith('y') ||       // "yes", "yea", "yeah"
        t === '1'
    );
}

function looksLikeCustomChoice(text: string): boolean {
    const t = text.toLowerCase().trim();
    return (
        t.includes('custom') || t.includes('my own') || t.includes('own') ||
        t.includes('provide') || t.includes('specific') ||
        t.includes('manual') || t.startsWith('n') ||  // "no", "nope", "no, I'll"
        t === '2'
    );
}

function looksLikeSolanaAddress(text: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text.trim());
}

// ─────────────────────────────────────────────────────────────────────────────

export function useAgent() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<AgentMessage[]>([DEFAULT_MESSAGE]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { connection, publicKey, sendTransaction, signTransaction, refreshBalance } = useSolana();

    // Pending staking state — stored in a ref so it survives re-renders without
    // triggering them, and is accessible inside async callbacks.
    const pendingStakeRef = useRef<PendingStake | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                const history = await aiService.getChatHistory();
                if (history && history.length > 0) {
                    const formattedHistory: AgentMessage[] = [];

                    for (let i = 0; i < history.length; i++) {
                        const msg = history[i];
                        const isApparentJson = msg.content.includes('{"actions"') || msg.content.includes('```json');

                        if (msg.role === 'agent' && isApparentJson) {
                            if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
                                formattedHistory.pop();
                            }
                            continue;
                        }

                        formattedHistory.push({
                            id: msg.id,
                            role: msg.role as 'user' | 'agent',
                            content: msg.content,
                            timestamp: new Date(msg.createdAt).getTime()
                        });
                    }

                    if (formattedHistory.length > 0) {
                        setMessages(formattedHistory);
                    } else {
                        setMessages([DEFAULT_MESSAGE]);
                    }
                } else {
                    setMessages([DEFAULT_MESSAGE]);
                }
            } else {
                setMessages([DEFAULT_MESSAGE]);
            }
        };

        fetchHistory();
    }, [user]);

    const addMessage = (role: 'user' | 'agent', content: string, overrides: Partial<AgentMessage> = {}) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const newMessage: AgentMessage = { id, role, content, timestamp: Date.now(), ...overrides };
        setMessages(prev => [...prev, newMessage]);
        return id;
    };

    // ─── Execute the actual staking once we have all info ────────────────────
    const executeStake = async (amount: number, validatorVoteKeyStr: string) => {
        if (!publicKey) {
            addMessage('agent', '⚠️ Please connect your Solana wallet first before staking.');
            return;
        }

        let validatorPubKey: PublicKey;
        try {
            validatorPubKey = new PublicKey(validatorVoteKeyStr);
        } catch {
            addMessage('agent', `❌ That doesn't look like a valid Solana public key. Please try staking again and provide a correct validator address.`);
            pendingStakeRef.current = null;
            return;
        }

        const isDefault = validatorVoteKeyStr === DEFAULT_VALIDATOR;
        addMessage('agent',
            `⏳ Staking ${amount} SOL with ${isDefault ? 'the auto-selected devnet validator' : `your validator (${validatorVoteKeyStr.slice(0, 8)}…)`}. Please approve the transaction in your wallet…`
        );

        try {
            const result = await stakingService.createAndDelegateStake(
                connection,
                publicKey,
                signTransaction,
                amount,
                validatorPubKey
            );

            await stakeService.persistStakeAccount({
                stakeAccountPubkey: result.stakeAccountPubkey,
                validatorVoteKey: result.validatorVoteKey,
                amount
            });

            addMessage('agent',
                `✅ Successfully staked ${amount} SOL!\n` +
                `Stake account: ${result.stakeAccountPubkey.slice(0, 8)}…${result.stakeAccountPubkey.slice(-6)}\n` +
                `Validator: ${isDefault ? 'Devnet auto-selected' : result.validatorVoteKey.slice(0, 8) + '…'}\n` +
                `Signature: ${result.signature.slice(0, 12)}…\n` +
                `View on Explorer ↗`
            );

            setTimeout(refreshBalance, 2000);
        } catch (e: any) {
            addMessage('agent', `❌ Staking failed: ${e.message}`);
        } finally {
            pendingStakeRef.current = null;
            setIsProcessing(false);
        }
    };

    // ─── Handle staking conversation turns ───────────────────────────────────
    const handleStakingConversation = async (userText: string): Promise<boolean> => {
        const pending = pendingStakeRef.current;
        if (!pending) return false;   // not in a staking conversation

        const trimmed = userText.trim();

        // ── Step 1: waiting for "auto" or "custom" ──
        if (pending.step === 'ask_validator_mode') {
            if (looksLikeAutoChoice(trimmed)) {
                // User wants automatic selection
                pendingStakeRef.current = null;
                setIsProcessing(true);
                await executeStake(pending.amount, DEFAULT_VALIDATOR);
                return true;
            }

            if (looksLikeCustomChoice(trimmed)) {
                // Ask for the specific address
                pendingStakeRef.current = { ...pending, step: 'ask_validator_key' };
                addMessage('agent',
                    `Please paste your validator vote account address.\n\n` +
                    `💡 You can find active validators and their addresses at:\n` +
                    `• https://www.validators.app\n` +
                    `• https://explorer.solana.com/validators?cluster=devnet (for devnet)`
                );
                return true;
            }

            // Ambiguous — re-prompt
            addMessage('agent',
                `I didn't quite catch that. Please reply:\n` +
                `• **"auto"** — I'll pick a reliable validator for you\n` +
                `• **"custom"** — you'll provide your own validator address`
            );
            return true;
        }

        // ── Step 2: waiting for the validator address ──
        if (pending.step === 'ask_validator_key') {
            if (looksLikeSolanaAddress(trimmed)) {
                pendingStakeRef.current = null;
                setIsProcessing(true);
                await executeStake(pending.amount, trimmed);
                return true;
            }

            // Check if they changed their mind and want auto
            if (looksLikeAutoChoice(trimmed)) {
                pendingStakeRef.current = null;
                setIsProcessing(true);
                await executeStake(pending.amount, DEFAULT_VALIDATOR);
                return true;
            }

            addMessage('agent',
                `That doesn't look like a valid Solana address (32–44 base58 characters).\n` +
                `Please try again, or reply **"auto"** to let me choose a validator for you.`
            );
            return true;
        }

        return false;
    };

    // ─── Pre-flight security checks ───────────────────────────────────────────
    /**
     * Validates a proposed action BEFORE executing it on-chain.
     * Returns `{ ok: true }` when safe to proceed, or `{ ok: false, reason }` with
     * a user-facing message that should be displayed.
     */
    const preFlight = async (opts: {
        amountSol?: number;        // SOL being spent (transfer amount, stake amount, swap source if SOL)
        recipient?: string;        // recipient pubkey string to validate
        actionLabel: string;       // e.g. "transfer 5 SOL", "stake 2 SOL"
        feeReserveSol?: number;    // extra SOL to reserve for fees (default 0.005)
    }): Promise<{ ok: true } | { ok: false; reason: string }> => {
        const FEE_RESERVE = opts.feeReserveSol ?? 0.005;

        // 1. Amount must be positive
        if (opts.amountSol !== undefined) {
            if (isNaN(opts.amountSol) || opts.amountSol <= 0) {
                return { ok: false, reason: `❌ The amount must be a positive number. You asked to ${opts.actionLabel} — please provide a valid amount.` };
            }
        }

        // 2. Recipient address must be a valid Solana public key
        if (opts.recipient) {
            try {
                new PublicKey(opts.recipient);
            } catch {
                return {
                    ok: false,
                    reason: `❌ The recipient address **${opts.recipient.slice(0, 12)}…** doesn't look like a valid Solana wallet address. Please double-check and try again.`
                };
            }
        }

        // 3. Check live on-chain balance for SOL-spending actions
        if (opts.amountSol !== undefined && publicKey) {
            let balance: number;
            try {
                balance = await solanaService.getBalance(connection, publicKey);
            } catch (e: any) {
                return { ok: false, reason: `❌ Could not fetch your wallet balance right now: ${e.message}. Please try again.` };
            }

            const required = opts.amountSol + FEE_RESERVE;
            if (balance < required) {
                const short = (required - balance).toFixed(4);
                return {
                    ok: false,
                    reason:
                        `❌ Insufficient balance to ${opts.actionLabel}.\n\n` +
                        `• **Your balance:** ${balance.toFixed(4)} SOL\n` +
                        `• **Required:** ${opts.amountSol} SOL + ~${FEE_RESERVE} SOL fee = ${required.toFixed(4)} SOL\n` +
                        `• **Short by:** ${short} SOL\n\n` +
                        `Please top up your wallet or reduce the amount.`
                };
            }
        }

        return { ok: true };
    };

    // ─── Main intent processor ────────────────────────────────────────────────
    const processIntent = async (text: string) => {
        if (!text.trim()) return;

        addMessage('user', text);
        setIsProcessing(true);

        // ── Intercept if we're in a pending staking conversation ──
        const handledByStaking = await handleStakingConversation(text);
        if (handledByStaking) {
            setIsProcessing(false);
            return;
        }

        // ── Normal AI intent processing ──
        try {
            const resolvedText = resolveMentions(text);
            const intent = await aiService.parseNaturalLanguageIntent(await resolvedText);

            if (!intent.actions || !Array.isArray(intent.actions)) {
                addMessage('agent', "Failed to parse actions.", { parsedIntent: intent });
                setIsProcessing(false);
                return;
            }

            for (const action of intent.actions) {
                let replyContent = '';

                if (action.type === 'unknown') {
                    replyContent = action.message || intent.rawResponse || "I couldn't understand that request. Could you rephrase it?";
                    if (replyContent.includes('{"actions"')) {
                        replyContent = "I couldn't understand that request. Could you rephrase it?";
                    }
                    addMessage('agent', replyContent, { parsedIntent: intent });
                    continue;
                }

                if (action.type === 'balance') {
                    if (!publicKey) {
                        addMessage('agent', "Please connect your Solana wallet so I can check your balance.", { parsedIntent: intent });
                        continue;
                    }
                    try {
                        const bal = await solanaService.getBalance(connection, publicKey);
                        addMessage('agent', `Your current balance is **${bal} SOL**.`, { parsedIntent: intent });
                        refreshBalance();
                    } catch (e: any) {
                        addMessage('agent', `❌ Failed to get balance: ${e.message}`, { parsedIntent: intent });
                    }
                    continue;
                }

                if (!publicKey) {
                    addMessage('agent', "Please connect your Solana wallet first to perform transactions.", { parsedIntent: intent });
                    break;
                }

                // ── Max amount calculation ──
                if (action.useMax) {
                    try {
                        const isSolSource =
                            (action.type === 'swap' && action.sourceToken?.toUpperCase() === 'SOL') ||
                            ((action.type === 'transfer' || action.type === 'stake') && action.token?.toUpperCase() === 'SOL');

                        if (isSolSource) {
                            const available = await solanaService.getBalance(connection, publicKey);
                            const amountToUse = available - 0.005;

                            if (amountToUse <= 0) {
                                addMessage('agent', `Your balance (${available} SOL) is too low after reserving fees.`, { parsedIntent: intent });
                                continue;
                            }

                            action.amount = Math.floor(amountToUse * 10000) / 10000;
                            addMessage('agent', `Auto-calculated amount: ${action.amount} SOL (reserved 0.005 SOL for fees).`, { parsedIntent: intent });
                        } else {
                            addMessage('agent', "I can currently only auto-calculate 'max' amounts for SOL.", { parsedIntent: intent });
                            continue;
                        }
                    } catch (e: any) {
                        addMessage('agent', `❌ Failed to check balance: ${e.message}`, { parsedIntent: intent });
                        continue;
                    }
                }

                // ── Staking: start the interactive conversation ──
                if (action.type === 'stake') {
                    if (!action.amount) {
                        addMessage('agent', "I need an amount to stake. How much SOL would you like to stake?", { parsedIntent: intent });
                        continue;
                    }

                    // Pre-flight: check balance before even asking about validator
                    // Staking requires rent exemption (~0.002 SOL) on top of the staked amount + fees
                    const stakeCheck = await preFlight({
                        amountSol: action.amount,
                        actionLabel: `stake ${action.amount} SOL`,
                        feeReserveSol: 0.01,   // rent exemption + tx fee
                    });
                    if (!stakeCheck.ok) {
                        addMessage('agent', stakeCheck.reason, { parsedIntent: intent });
                        continue;
                    }

                    // Kick off the multi-turn conversation
                    pendingStakeRef.current = {
                        step: 'ask_validator_mode',
                        amount: action.amount,
                    };

                    addMessage('agent',
                        `I'm ready to stake **${action.amount} SOL** for you! 🎯\n\n` +
                        `Before I proceed, would you like to:\n\n` +
                        `• **"auto"** — I'll automatically choose a reliable devnet validator\n` +
                        `• **"custom"** — You provide your own validator vote account address\n\n` +
                        `Which do you prefer?`,
                        { parsedIntent: intent }
                    );
                    continue;
                }

                // ── Transfer ──
                let transaction: VersionedTransaction | null = null;
                let replyMsg = '';

                if (action.type === 'transfer') {
                    if (!action.amount || !action.recipient) {
                        addMessage('agent', "I need an amount and a destination address to transfer.", { parsedIntent: intent });
                        continue;
                    }

                    // Pre-flight: validate address + check balance
                    const txCheck = await preFlight({
                        amountSol: action.amount,
                        recipient: action.recipient,
                        actionLabel: `transfer ${action.amount} SOL`,
                    });
                    if (!txCheck.ok) {
                        addMessage('agent', txCheck.reason, { parsedIntent: intent });
                        continue;
                    }

                    try {
                        transaction = await solanaService.createTransferTransaction(
                            connection,
                            publicKey,
                            new PublicKey(action.recipient),
                            action.amount
                        );
                        replyMsg = `⏳ Sending **${action.amount} SOL** to \`${action.recipient.slice(0, 8)}…\`\nPlease approve in your wallet.`;
                    } catch (e: any) {
                        addMessage('agent', `❌ Invalid transfer parameters: ${e.message}`);
                        continue;
                    }
                }

                // ── Swap ──
                else if (action.type === 'swap') {
                    if (!action.amount || !action.sourceToken || !action.destinationToken) {
                        addMessage('agent', "I need an amount, source token, and destination token to swap.", { parsedIntent: intent });
                        continue;
                    }

                    const sourceMint = TOKENS[action.sourceToken.toUpperCase()];
                    const destMint = TOKENS[action.destinationToken.toUpperCase()];

                    if (!sourceMint || !destMint) {
                        addMessage('agent', `Unsupported tokens. I currently support: ${Object.keys(TOKENS).join(', ')}.`, { parsedIntent: intent });
                        continue;
                    }

                    // Pre-flight: if swapping FROM SOL, check SOL balance
                    if (action.sourceToken.toUpperCase() === 'SOL') {
                        const swapCheck = await preFlight({
                            amountSol: action.amount,
                            actionLabel: `swap ${action.amount} SOL → ${action.destinationToken.toUpperCase()}`,
                        });
                        if (!swapCheck.ok) {
                            addMessage('agent', swapCheck.reason, { parsedIntent: intent });
                            continue;
                        }
                    }

                    try {
                        const sourceDecimals = action.sourceToken.toUpperCase() === 'SOL' ? 9 : 6;
                        const amountLamports = Math.floor(action.amount * (10 ** sourceDecimals));
                        const quoteInfo = await jupiterService.getQuote(sourceMint, destMint, amountLamports);

                        const destDecimals = action.destinationToken.toUpperCase() === 'SOL' ? 9 : 6;
                        const outAmountHuman = parseInt(quoteInfo.outAmount) / (10 ** destDecimals);

                        replyMsg = `⏳ Swapping **${action.amount} ${action.sourceToken.toUpperCase()}** → ~**${outAmountHuman.toFixed(4)} ${action.destinationToken.toUpperCase()}** via Jupiter…\nPlease approve in your wallet.`;

                        const { swapTransaction } = await jupiterService.getSwapTransaction(quoteInfo, publicKey.toString());
                        transaction = jupiterService.deserializeTransaction(swapTransaction);
                    } catch (e: any) {
                        addMessage('agent', `❌ Swap failed: ${e.message}`);
                        continue;
                    }
                }

                // ── Execute transaction ──
                if (transaction) {
                    try {
                        addMessage('agent', replyMsg, { parsedIntent: intent });
                        const signature = await sendTransaction(transaction, connection);

                        await transactionService.createTransaction({
                            signature,
                            type: action.type,
                            amount: action.amount || 0,
                            token: action.destinationToken || action.token || 'SOL',
                            recipient: action.recipient,
                            status: 'success'
                        });

                        addMessage('agent', `✅ Transaction sent!\nSignature: ${signature.slice(0, 12)}…`, { parsedIntent: intent });
                        setTimeout(refreshBalance, 2000);
                    } catch (executeError: any) {
                        addMessage('agent', `❌ Transaction failed: ${executeError.message}`, { parsedIntent: intent });
                    }
                }
            }
        } catch (error: any) {
            addMessage('agent', `An error occurred: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        messages,
        isProcessing,
        processIntent,
        hasPendingStake: pendingStakeRef.current !== null,
    };
}
