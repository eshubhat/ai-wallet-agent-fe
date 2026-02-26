import { Bot } from 'lucide-react';
import { type AgentMessage } from '../../types';
import { SimulationPreview } from '../transaction/SimulationPreview';

interface MessageBubbleProps {
    message: AgentMessage;
    isPendingTx: boolean;
    onConfirmTx: () => void;
    onCancelTx: () => void;
}

function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const secs = Math.floor(diff / 1000);
    if (secs < 10) return 'just now';
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
}

/** Render inline bold: **text** → <strong>text</strong> */
function renderInline(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
    });
}

/** Full markdown-lite renderer supporting bold, bullet lists, blank-line paragraphs */
function renderMarkdown(content: string): React.ReactNode {
    // Normalise line endings
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    const isBullet = (line: string) =>
        /^(\s*(•|\*|-)\s)/.test(line) ||   // • item  /  * item  /  - item
        /^(\s*\d+\.\s)/.test(line);         // 1. item

    const bulletText = (line: string) =>
        line.replace(/^\s*(•|\*|-|\d+\.)\s*/, '').trim();

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Blank line → small gap between paragraphs
        if (line.trim() === '') {
            elements.push(<div key={key++} style={{ height: '0.5rem' }} />);
            i++;
            continue;
        }

        // Colour-code ✅ / ❌ prefix lines
        if (line.startsWith('✅') || line.startsWith('❌') || line.startsWith('⏳') || line.startsWith('⚠️')) {
            const color = line.startsWith('✅') ? 'var(--success)'
                : line.startsWith('❌') ? 'var(--error)'
                    : line.startsWith('⏳') ? '#f59e0b'
                        : '#f59e0b';
            elements.push(
                <div key={key++} style={{ color, fontWeight: 500, marginBottom: '2px' }}>
                    {renderInline(line)}
                </div>
            );
            i++;
            continue;
        }

        // Collect consecutive bullet lines into a list
        if (isBullet(line)) {
            const items: string[] = [];
            while (i < lines.length && isBullet(lines[i])) {
                items.push(bulletText(lines[i]));
                i++;
            }
            elements.push(
                <ul key={key++} style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '4px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    {items.map((item, idx) => (
                        <li key={idx} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            paddingLeft: '4px'
                        }}>
                            <span style={{
                                flexShrink: 0,
                                marginTop: '3px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--accent-color)',
                                display: 'inline-block'
                            }} />
                            <span style={{ lineHeight: 1.55 }}>{renderInline(item)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Normal paragraph line
        elements.push(
            <div key={key++} style={{ lineHeight: 1.65, marginBottom: '1px' }}>
                {renderInline(line)}
            </div>
        );
        i++;
    }

    return <>{elements}</>;
}

export function MessageBubble({ message, isPendingTx, onConfirmTx, onCancelTx }: MessageBubbleProps) {
    const isAgent = message.role === 'agent';

    return (
        <div className={`message-row ${message.role}`}>
            {isAgent && (
                <div className="avatar-bot" style={{ marginTop: '4px' }}>
                    <Bot size={15} />
                </div>
            )}

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: isAgent ? 'flex-start' : 'flex-end',
                maxWidth: '78%'
            }}>
                <div className={`message-bubble ${message.role}`}>
                    {isAgent ? renderMarkdown(message.content) : (
                        <div style={{ lineHeight: 1.65 }}>{message.content}</div>
                    )}

                    {isAgent && message.simulateResult && (
                        <SimulationPreview
                            result={message.simulateResult}
                            isPending={isPendingTx}
                            onConfirm={onConfirmTx}
                            onCancel={onCancelTx}
                        />
                    )}
                </div>

                <span className="message-timestamp">
                    {getRelativeTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
}
