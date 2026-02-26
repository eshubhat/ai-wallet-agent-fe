import { useState, useEffect } from 'react';
import { Settings, X, Save, Bot, Sparkles, Cpu } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({
        gemini: '',
        openai: '',
        anthropic: ''
    });
    const [savedMsg, setSavedMsg] = useState('');

    const providers = [
        { id: 'gemini', name: 'Google Gemini', icon: <Sparkles size={16} color="#4285F4" /> },
        { id: 'openai', name: 'OpenAI (ChatGPT)', icon: <Bot size={16} color="#10a37f" /> },
        { id: 'anthropic', name: 'Anthropic (Claude)', icon: <Cpu size={16} color="#d97757" /> },
    ];

    useEffect(() => {
        if (isOpen) {
            const savedProvider = localStorage.getItem('ai_agent_llm_provider') as any;
            if (savedProvider) setProvider(savedProvider);

            setApiKeys({
                gemini: localStorage.getItem('ai_agent_user_api_key_gemini') || '',
                openai: localStorage.getItem('ai_agent_user_api_key_openai') || '',
                anthropic: localStorage.getItem('ai_agent_user_api_key_anthropic') || ''
            });

            // Fallback to migrate old flat key structure
            if (localStorage.getItem('ai_agent_user_api_key') && savedProvider) {
                setApiKeys(prev => ({ ...prev, [savedProvider]: localStorage.getItem('ai_agent_user_api_key') || '' }));
                localStorage.removeItem('ai_agent_user_api_key');
            }

            setSavedMsg('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('ai_agent_llm_provider', provider);

        ['gemini', 'openai', 'anthropic'].forEach(p => {
            if (apiKeys[p]?.trim()) {
                localStorage.setItem(`ai_agent_user_api_key_${p}`, apiKeys[p].trim());
            } else {
                localStorage.removeItem(`ai_agent_user_api_key_${p}`);
            }
        });

        setSavedMsg('Settings saved locally!');
        setTimeout(() => setSavedMsg(''), 3000);
    };

    const handleClear = () => {
        ['gemini', 'openai', 'anthropic'].forEach(p => {
            localStorage.removeItem(`ai_agent_user_api_key_${p}`);
        });
        localStorage.removeItem('ai_agent_user_api_key');
        setApiKeys({ gemini: '', openai: '', anthropic: '' });
        setSavedMsg('API keys cleared!');
        setTimeout(() => setSavedMsg(''), 3000);
    };

    return (
        <div style={{
            position: 'fixed', top: 250, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                backgroundColor: '#1a1b23',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Settings size={24} /> AI Settings
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Premium Grid Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select AI Model</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {providers.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setProvider(p.id as any)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px 8px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        background: provider === p.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: provider === p.id ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s',
                                        boxShadow: provider === p.id ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (provider !== p.id) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (provider !== p.id) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '50%',
                                        background: provider === p.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}>
                                        {p.icon}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: provider === p.id ? 600 : 500, color: provider === p.id ? 'white' : 'var(--text-secondary)' }}>
                                            {p.name.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Custom API Key (Optional)
                        </label>
                        <input
                            type="password"
                            placeholder={`Leave blank to use default server key`}
                            value={apiKeys[provider] || ''}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white'
                            }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                            Keys are saved only in your local browser and never sent to our database.
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            onClick={handleClear}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,100,100,0.3)',
                                background: 'rgba(255,100,100,0.1)', color: '#ff6b6b', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,100,100,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,100,100,0.1)'}
                        >
                            Clear Keys
                        </button>
                        <button
                            onClick={handleSave}
                            className="pulse-effect"
                            style={{
                                flex: 2, padding: '12px', borderRadius: '8px', border: 'none',
                                background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Save size={18} /> Save Settings
                        </button>
                    </div>
                    {savedMsg && (
                        <div style={{ color: '#4caf50', fontSize: '0.9rem', textAlign: 'center' }}>
                            {savedMsg}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
