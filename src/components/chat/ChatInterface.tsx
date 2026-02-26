import { useEffect, useRef, useState } from 'react';
import { useAgent } from '../../hooks/useAgent';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Wallet, ArrowRightLeft, TrendingUp, Search } from 'lucide-react';

const QUICK_COMMANDS = [
    { icon: <Search size={13} />, label: 'Check Balance', prompt: 'What is my current SOL balance?' },
    { icon: <Wallet size={13} />, label: 'Send SOL', prompt: 'Send 0.1 SOL to ' },
    { icon: <ArrowRightLeft size={13} />, label: 'Swap Tokens', prompt: 'Swap 0.5 SOL to USDC' },
    { icon: <TrendingUp size={13} />, label: 'Stake SOL', prompt: 'Stake 1 SOL' },
];

export function ChatInterface() {
    const { messages, isProcessing, processIntent, hasPendingStake } = useAgent();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [prefillText, setPrefillText] = useState<string | undefined>(undefined);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    const handleChipClick = (prompt: string) => {
        // If the prompt ends with a space it means user needs to fill in recipient — prefill only
        if (prompt.endsWith(' ')) {
            setPrefillText(prompt);
        } else {
            // Send immediately
            processIntent(prompt);
        }
    };

    // Show welcome hero only when the only message is the default agent greeting
    const showWelcome = messages.length === 1 && messages[0].role === 'agent';

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {showWelcome ? (
                    /* ── Welcome Hero ── */
                    <div className="welcome-hero">
                        {/* <div className="welcome-hero-icon">🤖</div> */}

                        <div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                Your AI Solana Agent
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '380px', lineHeight: 1.65 }}>
                                I can transfer SOL, swap tokens, stake, check balances, and more — just tell me what you'd like to do.
                            </p>
                        </div>

                        {/* Quick command chips */}
                        <div className="quick-commands">
                            {QUICK_COMMANDS.map((cmd) => (
                                <button
                                    key={cmd.label}
                                    className="cmd-chip"
                                    onClick={() => handleChipClick(cmd.prompt)}
                                >
                                    {cmd.icon}
                                    {cmd.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* ── Messages ── */
                    <>
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isPendingTx={false}
                                onConfirmTx={() => { }}
                                onCancelTx={() => { }}
                            />
                        ))}
                    </>
                )}

                {/* Typing indicator */}
                {isProcessing && (
                    <div className="message-row agent">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(123,66,246,0.15)', border: '1px solid rgba(123,66,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', marginTop: '4px' }}>
                            🤖
                        </div>
                        <div className="message-bubble agent" style={{ padding: '0.75rem 1.25rem' }}>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                contextPlaceholder={
                    hasPendingStake
                        ? 'Reply: "auto" or "custom" (or paste a validator address)…'
                        : undefined
                }
                onSend={(text) => {
                    setPrefillText(undefined);
                    processIntent(text);
                }}
                disabled={isProcessing}
                prefillText={prefillText}
            />
        </div>
    );
}
