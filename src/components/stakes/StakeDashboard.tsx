import { useState, useEffect } from 'react';
import { type StakeAccount } from '../../services/stake.service';
import { Activity, RefreshCw } from 'lucide-react';

export function StakeDashboard({ stakes, loading }: { stakes: StakeAccount[], loading: boolean }) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        if (!loading) {
            setLastUpdated(new Date());
        }
    }, [stakes, loading]);

    const shortenPubkey = (key: string) => {
        if (!key) return '';
        return `${key.slice(0, 4)}...${key.slice(-4)}`;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#4caf50'; // Green
            case 'activating': return '#ff9800'; // Orange
            case 'deactivating': return '#f44336'; // Red
            case 'inactive': return '#9e9e9e'; // Grey
            default: return '#9e9e9e';
        }
    };

    if (loading && stakes.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                <RefreshCw className="spin" size={24} color="var(--primary)" />
            </div>
        );
    }

    if (stakes.length === 0) {
        return null; // hide if no stakes yet to keep it minimal
    }

    return (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem' }}>
                    <Activity size={20} color="var(--primary)" /> Active Stakes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Refreshes every 30s
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                        Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stakes.map((stake) => (
                    <div
                        key={stake.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text)' }}>
                                {shortenPubkey(stake.stakeAccountPubkey)}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {stake.amount} SOL
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(stake.activationState)
                            }} />
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: getStatusColor(stake.activationState),
                                textTransform: 'capitalize'
                            }}>
                                {stake.activationState || 'Unknown'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
