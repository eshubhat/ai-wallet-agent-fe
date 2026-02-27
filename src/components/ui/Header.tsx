import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Users, Settings, LogIn, LogOut, Activity, Bot } from 'lucide-react';
import { ContactsModal } from '../contacts/ContactsModal';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../../contexts/AuthContext';

const NavIconBtn = ({
    icon, label, onClick, danger = false
}: { icon: React.ReactNode; label?: string; onClick: () => void; danger?: boolean }) => (
    <button
        onClick={onClick}
        className="btn-ghost"
        style={{
            padding: label ? '8px 14px' : '8px 10px',
            color: danger ? '#ef4444' : undefined,
            border: danger ? '1px solid rgba(239,68,68,0.25)' : undefined,
            background: danger ? 'rgba(239,68,68,0.08)' : undefined,
            gap: '6px',
        }}
        title={label}
    >
        {icon}
        {label && <span style={{ fontSize: '0.85rem' }}>{label}</span>}
    </button>
);

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const path = useLocation().pathname;
    const [isContactsOpen, setIsContactsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleProtectedAction = (action: () => void) => {
        if (!user) {
            showToast('Please login to enable this feature');
            return;
        }
        action();
    };

    const initials = user
        ? (user.name || user.email)
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : '';

    return (
        <header className="app-header">
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--accent-color), #2dd4bf)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Bot size={18} color="#fff" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.2rem', letterSpacing: '-0.01em', margin: 0 }}>
                        Auto<span style={{ color: 'var(--accent-color)' }}>Fi</span>
                    </h2>
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        background: 'var(--accent-color)',
                        color: 'white',
                        fontWeight: 600
                    }}>
                        v{__APP_VERSION__}
                    </span>
                </div>
            </div>

            {/* Right side actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NavIconBtn
                    icon={<Users size={15} />}
                    label="Contacts"
                    onClick={() => handleProtectedAction(() => setIsContactsOpen(true))}
                />
                <NavIconBtn
                    icon={<Activity size={15} />}
                    label={path === "/analytics" ? "Chat" : "Analytics"}
                    onClick={() => handleProtectedAction(() => navigate(path === "/analytics" ? "/" : "/analytics"))}
                />
                <NavIconBtn
                    icon={<Settings size={15} />}
                    label="Settings"
                    onClick={() => setIsSettingsOpen(true)}
                />

                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

                <WalletMultiButton />

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar" title={user.name || user.email}>
                            {initials}
                        </div>
                        <NavIconBtn
                            icon={<LogOut size={14} />}
                            label="Logout"
                            onClick={logout}
                            danger
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/auth')}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.88rem', height: '36px' }}
                    >
                        <LogIn size={14} /> Get Started
                    </button>
                )}
            </div>

            <ContactsModal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Toast Notification */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(153, 69, 255, 0.5)',
                    boxShadow: '0 0 15px rgba(153, 69, 255, 0.4)',
                    fontSize: '0.9rem',
                    zIndex: 9999,
                    animation: 'fadeInOut 0.3s ease',
                }}>
                    {toastMessage}
                </div>
            )}
        </header>
    );
};
