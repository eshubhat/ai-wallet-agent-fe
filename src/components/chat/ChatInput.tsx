import { useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import { SendIcon } from 'lucide-react';
import { contactService, type Contact } from '../../services/contact.service';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState<Contact[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionStartIdx, setMentionStartIdx] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

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

        // Find @ followed by word characters right before cursor
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

            const newText = beforeMention + `@${contact.name} ` + afterMentionText;
            setText(newText);
        }
        setSuggestions([]);
        setMentionStartIdx(null);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
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
            {suggestions.length > 0 && (
                <div className="mentions-dropdown glass-panel" style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    marginBottom: '8px',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {suggestions.map((contact, index) => (
                        <div
                            key={contact.id}
                            className={`mention-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                background: index === activeSuggestionIndex ? 'rgba(255,255,255,0.1)' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: 'var(--text)'
                            }}
                            onClick={() => applySuggestion(contact)}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                        >
                            <span style={{ fontWeight: 'bold' }}>@{contact.name}</span>
                            <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{contact.address.slice(0, 4)}...{contact.address.slice(-4)}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="chat-input-container glass-panel">
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder={disabled ? "Processing..." : "e.g., Send 0.1 SOL to @rahul..."}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    autoFocus
                />
                <button
                    className="chat-submit-btn"
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                >
                    <SendIcon size={20} />
                </button>
            </div>
        </div>
    );
}
