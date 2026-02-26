import { useState, useEffect } from 'react';
import { type StakeAccount } from '../../services/stake.service';
import { Activity, RefreshCw, Layers } from 'lucide-react';

export function StakeDashboard({ stakes, loading }: { stakes: StakeAccount[], loading: boolean }) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        if (!loading) setLastUpdated(new Date());
    }, [stakes, loading]);

    const shortenPubkey = (key: string) => {
        if (!key) return '';
        return `${key.slice(0, 4)}...${key.slice(-4)}`;
    };

    const statusColors: Record<string, string> = {
        active: '#10b981',
        activating: '#f59e0b',
        deactivating: '#ef4444',
        inactive: '#6b7280',
    };

    const getStatusColor = (status: string) =>
        statusColors[status?.toLowerCase()] ?? '#6b7280';

    return (
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    <Activity size={17} color="var(--accent-color)" /> Active Stakes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Auto-refresh · 30s</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Loading spinner */}
            {loading && stakes.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
                    <RefreshCw className="spin" size={22} color="var(--accent-color)" />
                </div>
            )}

            {/* Empty state */}
            {!loading && stakes.length === 0 && (
                <div className="empty-state">
                    <Layers size={28} className="empty-state-icon" />
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        No active stakes yet.
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        Try: <em>"Stake 1 SOL"</em>
                    </p>
                </div>
            )}

            {/* Stake list */}
            {stakes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stakes.map((stake) => (
                        <div
                            key={stake.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '10px'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                    {shortenPubkey(stake.stakeAccountPubkey)}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    {stake.amount} SOL
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '7px', height: '7px', borderRadius: '50%',
                                    backgroundColor: getStatusColor(stake.activationState)
                                }} />
                                <span style={{
                                    fontSize: '0.8rem', fontWeight: 500,
                                    color: getStatusColor(stake.activationState),
                                    textTransform: 'capitalize'
                                }}>
                                    {stake.activationState || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
