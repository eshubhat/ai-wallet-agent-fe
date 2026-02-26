import { useEffect, useRef } from 'react';
import { useAgent } from '../../hooks/useAgent';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export function ChatInterface() {
    const {
        messages,
        isProcessing,
        processIntent
    } = useAgent();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isPendingTx={false}
                        onConfirmTx={() => { }}
                        onCancelTx={() => { }}
                    />
                ))}

                {isProcessing && (
                    <div className="message-row agent">
                        <div className="message-bubble agent">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={processIntent} disabled={isProcessing} />
        </div>
    );
}
