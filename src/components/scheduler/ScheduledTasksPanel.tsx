import { type ScheduledTask } from '../../types';
import { XCircle, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
    tasks: ScheduledTask[];
    loading: boolean;
    onCancel: (id: string) => void;
    onExecuteFromBanner: (task: ScheduledTask) => void;
}

export const ScheduledTasksPanel = ({ tasks, loading, onCancel, onExecuteFromBanner }: Props) => {
    if (loading) {
        return (
            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Scheduled Tasks</h3>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <div className="spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--text-dim)', borderTopColor: 'var(--primary)' }} />
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return null;
    }

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Scheduled Tasks
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(task => {
                    const isTriggered = task.status === 'triggered';
                    return (
                        <div key={task.id} style={{
                            background: isTriggered ? 'rgba(76, 175, 80, 0.1)' : 'var(--surface-light)',
                            border: isTriggered ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            animation: 'fadeSlideUp 0.3s ease-out'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-light)', lineHeight: 1.4 }}>
                                    {task.label}
                                </div>
                                {!isTriggered && (
                                    <button
                                        onClick={() => onCancel(task.id)}
                                        className="btn-ghost"
                                        style={{ padding: '4px', color: 'var(--text-dim)' }}
                                        title="Cancel Task"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    background: isTriggered ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    color: isTriggered ? '#4caf50' : 'var(--text-dim)'
                                }}>
                                    {isTriggered ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                                    {isTriggered ? 'Triggered! Awaiting Execution' :
                                        task.triggerType === 'time' ? `Scheduled` :
                                            task.triggerType === 'idle' ? `Idle Monitor` : 'Price Monitor'
                                    }
                                </div>
                                {isTriggered && (
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '4px 12px', fontSize: '0.8rem', minHeight: 'unset', color: 'white' }}
                                        onClick={() => onExecuteFromBanner(task)}
                                    >
                                        Execute
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
