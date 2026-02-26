import { useState, useEffect } from 'react';
import { type Transaction } from '../../services/transaction.service';
import { History, RefreshCw, ArrowRightLeft, ArrowRight, CircleDollarSign, Receipt } from 'lucide-react';

export function TransactionHistory({ transactions, loading }: { transactions: Transaction[], loading: boolean }) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        if (!loading) setLastUpdated(new Date());
    }, [transactions, loading]);

    const shortenSig = (sig: string) => {
        if (!sig) return '';
        return `${sig.slice(0, 4)}…${sig.slice(-4)}`;
    };

    const statusColors: Record<string, string> = {
        success: '#10b981',
        completed: '#10b981',
        pending: '#f59e0b',
        failed: '#ef4444',
    };

    const getStatusColor = (s: string) => statusColors[s?.toLowerCase()] ?? '#6b7280';

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'swap': return <ArrowRightLeft size={15} color="var(--accent-color)" />;
            case 'stake': return <CircleDollarSign size={15} color="#f59e0b" />;
            case 'transfer': return <ArrowRight size={15} color="#38bdf8" />;
            default: return <History size={15} color="var(--text-secondary)" />;
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    <History size={17} color="var(--accent-color)" /> Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Auto-refresh · 30s</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Loading */}
            {loading && transactions.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
                    <RefreshCw className="spin" size={22} color="var(--accent-color)" />
                </div>
            )}

            {/* Empty state */}
            {!loading && transactions.length === 0 && (
                <div className="empty-state">
                    <Receipt size={28} className="empty-state-icon" />
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        No transactions yet.
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        Try: <em>"Send 0.1 SOL to …"</em>
                    </p>
                </div>
            )}

            {/* Transaction list */}
            {transactions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {getIcon(tx.type)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                        {tx.type}
                                    </span>
                                    <a
                                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--accent-color)', textDecoration: 'none' }}
                                    >
                                        {shortenSig(tx.signature)}
                                    </a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {tx.amount} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{tx.token || 'SOL'}</span>
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        backgroundColor: getStatusColor(tx.status)
                                    }} />
                                    <span style={{ fontSize: '0.72rem', color: getStatusColor(tx.status), textTransform: 'capitalize' }}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
