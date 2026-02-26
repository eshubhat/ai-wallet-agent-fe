import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Users, Settings, LogIn, LogOut, Activity } from 'lucide-react';
import { ContactsModal } from '../contacts/ContactsModal';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isContactsOpen, setIsContactsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <header className="app-header">
            <div className="logo-section">
                <h2>AgentWallet<span style={{ color: 'var(--accent-color)' }}>.AI</span></h2>
            </div>
            <div className="wallet-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                        }}>
                            {user.name || user.email.split('@')[0]}
                        </div>
                        <button
                            onClick={logout}
                            className="glass-panel"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444', fontWeight: 'bold'
                            }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/auth')}
                        className="glass-panel"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 12px', border: '1px solid var(--accent-color)',
                            borderRadius: '8px', cursor: 'pointer', background: 'var(--accent-color)',
                            color: 'white', fontWeight: 'bold'
                        }}
                    >
                        <LogIn size={16} /> Get Started
                    </button>
                )}

                <button
                    onClick={() => setIsContactsOpen(true)}
                    className="glass-panel"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text)', fontWeight: 'bold'
                    }}
                >
                    <Users size={16} /> Contacts
                </button>
                <button
                    onClick={() => navigate('/analytics')}
                    className="glass-panel"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text)', fontWeight: 'bold'
                    }}
                >
                    <Activity size={16} /> Analytics
                </button>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="glass-panel"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text)', fontWeight: 'bold'
                    }}
                    title="AI Settings"
                >
                    <Settings size={16} />
                </button>
                <WalletMultiButton />
            </div>

            <ContactsModal
                isOpen={isContactsOpen}
                onClose={() => setIsContactsOpen(false)}
            />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </header>
    );
};
