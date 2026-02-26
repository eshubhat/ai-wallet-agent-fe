import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { SendIcon } from 'lucide-react';
import { contactService, type Contact } from '../../services/contact.service';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    prefillText?: string;
    contextPlaceholder?: string;
}

export function ChatInput({ onSend, disabled, prefillText, contextPlaceholder }: ChatInputProps) {
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState<Contact[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionStartIdx, setMentionStartIdx] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Pre-fill from parent (quick commands)
    useEffect(() => {
        if (prefillText !== undefined) {
            setText(prefillText);
            inputRef.current?.focus();
        }
    }, [prefillText]);

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text);
            setText('');
            setSuggestions([]);
            setMentionStartIdx(null);
        }
    };

    const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setText(val);

        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = val.slice(0, cursorPosition);
        const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

        if (match) {
            const query = match[1];
            contactService.searchContacts(query).then(foundContacts => {
                setSuggestions(foundContacts);
                setMentionSearch(query);
                setActiveSuggestionIndex(0);
                setMentionStartIdx(match.index !== undefined ? match.index : null);
            });
        } else {
            setSuggestions([]);
            setMentionStartIdx(null);
        }
    };

    const applySuggestion = (contact: Contact) => {
        if (mentionStartIdx !== null) {
            const beforeMention = text.slice(0, mentionStartIdx);
            const afterMentionText = text.slice(mentionStartIdx + 1 + mentionSearch.length);
            setText(beforeMention + `@${contact.name} ` + afterMentionText);
        }
        setSuggestions([]);
        setMentionStartIdx(null);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                applySuggestion(suggestions[activeSuggestionIndex]);
                return;
            }
            if (e.key === 'Escape') {
                setSuggestions([]);
                setMentionStartIdx(null);
                return;
            }
        }
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chat-input-wrapper" style={{ position: 'relative', width: '100%' }}>
            {/* @mention autocomplete dropdown */}
            {suggestions.length > 0 && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0, right: 0,
                    marginBottom: '8px',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto',
                }}>
                    {suggestions.map((contact, index) => (
                        <div
                            key={contact.id}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                background: index === activeSuggestionIndex ? 'rgba(123,66,246,0.1)' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onClick={() => applySuggestion(contact)}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                        >
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>@{contact.name}</span>
                            <span style={{ opacity: 0.45, fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                {contact.address.slice(0, 4)}…{contact.address.slice(-4)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main input row */}
            <div className="chat-input-container glass-panel" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder={
                        disabled
                            ? 'Agent is thinking…'
                            : contextPlaceholder
                            || 'Ask me anything — "Send 0.5 SOL to @alice"'
                    }
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    autoFocus
                />

                {/* Keyboard hint */}
                {text.trim() && !disabled && (
                    <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        opacity: 0.6,
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                    }}>
                        ↵ send
                    </span>
                )}

                <button
                    className={`chat-submit-btn${disabled ? ' processing' : ''}`}
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                >
                    <SendIcon size={18} />
                </button>
            </div>
        </div>
    );
}
