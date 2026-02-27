import { X, Play } from 'lucide-react';
import { type ScheduledTask } from '../../types';

interface Props {
    task: ScheduledTask;
    onDismiss: (id: string) => void;
    onExecute: (task: ScheduledTask) => void;
}

export const NotificationBanner = ({ task, onDismiss, onExecute }: Props) => {
    return (
        <div style={{
            background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.25), rgba(20, 21, 26, 0.95))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderLeft: '4px solid #4CAF50',
            borderRadius: '8px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            animation: 'fadeSlideUp 0.4s ease-out backwards',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#4CAF50', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Task Triggered
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: '1.05rem', lineHeight: 1.4 }}>
                    Condition met for: <strong>{task.label}</strong>
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    Because you hold your keys, please review and execute this transaction.
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    className="btn-primary"
                    onClick={() => onExecute(task)}
                    style={{ background: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Play size={16} fill="currentColor" /> Execute Now
                </button>
                <button
                    className="btn-ghost"
                    onClick={() => onDismiss(task.id)}
                    style={{ padding: '8px', color: 'var(--text-dim)' }}
                    title="Dismiss"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
