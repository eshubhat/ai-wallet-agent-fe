import { useState, useEffect } from 'react';
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

const DEFAULT_MESSAGE: AgentMessage = {
    id: 'default-1',
    role: 'agent',
    content: "Hi! I'm your Solana AI Agent. I can help you transfer SOL, swap tokens, stake, or check your balance. What would you like to do?",
    timestamp: Date.now()
};

export function useAgent() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<AgentMessage[]>([DEFAULT_MESSAGE]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { connection, publicKey, sendTransaction, signTransaction, refreshBalance } = useSolana();

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                const history = await aiService.getChatHistory();
                if (history && history.length > 0) {
                    const formattedHistory: AgentMessage[] = [];

                    for (let i = 0; i < history.length; i++) {
                        const msg = history[i];
                        const isApparentJson = msg.content.includes('{"actions"') || msg.content.includes('```json');

                        // If we find an agent JSON payload
                        if (msg.role === 'agent' && isApparentJson) {
                            // Specifically remove the immediately preceding user prompt
                            if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
                                formattedHistory.pop();
                            }
                            continue; // Skip appending this JSON payload
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
                // If not logged in, just show the default message
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

    const processIntent = async (text: string) => {
        if (!text.trim()) return;

        addMessage('user', text);
        console.log("text: ", text)
        setIsProcessing(true);

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
                        replyContent = "Please connect your wallet so I can check your balance.";
                        addMessage('agent', replyContent, { parsedIntent: intent });
                        continue;
                    }

                    try {
                        const bal = await solanaService.getBalance(connection, publicKey);
                        replyContent = `Your current balance is ${bal} SOL.`;
                        addMessage('agent', replyContent, { parsedIntent: intent });
                        refreshBalance();
                    } catch (e: any) {
                        addMessage('agent', `Failed to get balance: ${e.message}`, { parsedIntent: intent });
                    }
                    continue;
                }

                if (!publicKey) {
                    replyContent = "Please connect your wallet first to perform transactions.";
                    addMessage('agent', replyContent, { parsedIntent: intent });
                    break;
                }

                let transaction: VersionedTransaction | null = null;
                let replyMsg = '';

                if (action.useMax) {
                    try {
                        let available = 0;
                        const isSolSource =
                            (action.type === 'swap' && action.sourceToken?.toUpperCase() === 'SOL') ||
                            ((action.type === 'transfer' || action.type === 'stake') && action.token?.toUpperCase() === 'SOL');

                        if (isSolSource) {
                            available = await solanaService.getBalance(connection, publicKey);
                            const amountToUse = available - 0.005; // Reserve 0.005 for network/rent fees

                            if (amountToUse <= 0) {
                                addMessage('agent', `Your balance (${available} SOL) is too low after reserving fees.`, { parsedIntent: intent });
                                continue;
                            }

                            // Safe floor rounding
                            action.amount = Math.floor(amountToUse * 10000) / 10000;
                            addMessage('agent', `Auto-calculated amount: ${action.amount} SOL (reserved 0.005 SOL for fees).`, { parsedIntent: intent });
                        } else {
                            addMessage('agent', "I can currently only auto-calculate 'max' amounts natively for SOL.", { parsedIntent: intent });
                            continue;
                        }
                    } catch (e: any) {
                        addMessage('agent', `Failed to check balance: ${e.message}`, { parsedIntent: intent });
                        continue;
                    }
                }

                if (action.type === 'transfer') {
                    if (!action.amount || !action.recipient) {
                        replyMsg = "I need an amount and destination address to transfer.";
                        addMessage('agent', replyMsg, { parsedIntent: intent });
                        continue;
                    }
                    try {
                        transaction = await solanaService.createTransferTransaction(
                            connection,
                            publicKey,
                            new PublicKey(action.recipient),
                            action.amount
                        );
                        replyMsg = `I've prepared a transfer of ${action.amount} SOL to ${action.recipient}...`;
                    } catch (e: any) {
                        addMessage('agent', `Invalid transfer parameters: ${e.message}`);
                        continue;
                    }
                } else if (action.type === 'swap') {
                    if (!action.amount || !action.sourceToken || !action.destinationToken) {
                        replyMsg = "I need an amount, source token, and destination token to swap.";
                        addMessage('agent', replyMsg, { parsedIntent: intent });
                        continue;
                    }

                    const sourceMint = TOKENS[action.sourceToken.toUpperCase()];
                    const destMint = TOKENS[action.destinationToken.toUpperCase()];

                    if (!sourceMint || !destMint) {
                        replyMsg = `Unsupported tokens. Valid tokens are: ${Object.keys(TOKENS).join(', ')}`;
                        addMessage('agent', replyMsg, { parsedIntent: intent });
                        continue;
                    }

                    try {
                        const sourceDecimals = action.sourceToken.toUpperCase() === 'SOL' ? 9 : 6;
                        const amountLamports = Math.floor(action.amount * (10 ** sourceDecimals));

                        const quoteInfo = await jupiterService.getQuote(sourceMint, destMint, amountLamports);

                        const destDecimals = action.destinationToken.toUpperCase() === 'SOL' ? 9 : 6;
                        const outAmountHuman = parseInt(quoteInfo.outAmount) / (10 ** destDecimals);

                        replyMsg = `I found a route! Swapping ${action.amount} ${action.sourceToken.toUpperCase()} for ~${outAmountHuman.toFixed(4)} ${action.destinationToken.toUpperCase()} via Jupiter... Note: This will likely fail since you are on Devnet.`;

                        const { swapTransaction } = await jupiterService.getSwapTransaction(quoteInfo, publicKey.toString());
                        transaction = jupiterService.deserializeTransaction(swapTransaction);
                    } catch (e: any) {
                        addMessage('agent', `Jupiter swap failed building: ${e.message}`);
                        continue;
                    }
                } else if (action.type === 'stake') {
                    if (!action.amount) {
                        addMessage('agent', "I need an amount to stake.", { parsedIntent: intent });
                        continue;
                    }

                    try {
                        addMessage('agent', `Preparing to stake ${action.amount} SOL...`, { parsedIntent: intent });
                        // We await the custom staking service which handles both signature gathering and sending implicitly. 
                        const result = await stakingService.createAndDelegateStake(
                            connection,
                            publicKey,
                            signTransaction,
                            action.amount
                        );

                        // Persist the new stake account to our DB automatically
                        await stakeService.persistStakeAccount({
                            stakeAccountPubkey: result.stakeAccountPubkey,
                            validatorVoteKey: result.validatorVoteKey,
                            amount: action.amount
                        });

                        addMessage('agent', `✅ Successfully staked ${action.amount} SOL! \nSignature: ${result.signature} \nValidator: public devnet vote key`, { parsedIntent: intent });
                        setTimeout(refreshBalance, 2000);
                    } catch (e: any) {
                        addMessage('agent', `❌ Staking failed: ${e.message}`);
                    }
                    // Staking service handled the sent transaction internally, so we don't populate 'transaction' hook variable
                    continue;
                }

                if (transaction) {
                    try {
                        addMessage('agent', replyMsg, { parsedIntent: intent });
                        const signature = await sendTransaction(transaction, connection);

                        // Explicitly record successful standard transactions (swaps, transfers) into the Postgres DB
                        await transactionService.createTransaction({
                            signature,
                            type: action.type,
                            amount: action.amount || 0,
                            token: action.destinationToken || action.token || 'SOL', // Coalesce generic tokens 
                            recipient: action.recipient,
                            status: 'success'
                        });

                        addMessage('agent', `✅ Transaction sent! Signature: ${signature}`, {
                            parsedIntent: intent
                        });

                        setTimeout(refreshBalance, 2000);
                    } catch (executeError: any) {
                        addMessage('agent', `❌ Transaction failed to send: ${executeError.message}`, {
                            parsedIntent: intent
                        });
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
        processIntent
    };
}
