import { useState, useEffect } from 'react';
import { type Transaction } from '../../services/transaction.service';
import { History, RefreshCw, ArrowRightLeft, ArrowRight, CircleDollarSign } from 'lucide-react';

export function TransactionHistory({ transactions, loading }: { transactions: Transaction[], loading: boolean }) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        if (!loading) {
            setLastUpdated(new Date());
        }
    }, [transactions, loading]);

    const shortenSignature = (sig: string) => {
        if (!sig) return '';
        return `${sig.slice(0, 4)}...${sig.slice(-4)}`;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'completed': return '#4caf50'; // Green
            case 'pending': return '#ff9800'; // Orange
            case 'failed': return '#f44336'; // Red
            default: return '#9e9e9e';
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'swap': return <ArrowRightLeft size={16} color="var(--accent-color)" />;
            case 'stake': return <CircleDollarSign size={16} color="var(--primary)" />;
            case 'transfer': return <ArrowRight size={16} color="#03a9f4" />;
            default: return <History size={16} color="var(--text-secondary)" />;
        }
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                <RefreshCw className="spin" size={24} color="var(--accent-color)" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return null;
    }

    return (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem' }}>
                    <History size={20} color="var(--accent-color)" /> Activity
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
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {getTransactionIcon(tx.type)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text)', textTransform: 'capitalize', fontWeight: 500 }}>
                                    {tx.type}
                                </span>
                                <a
                                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        color: 'var(--accent-color)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {shortenSignature(tx.signature)}
                                </a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                                {tx.amount} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.token || 'SOL'}</span>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: getStatusColor(tx.status)
                                }} />
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: getStatusColor(tx.status),
                                    textTransform: 'capitalize'
                                }}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
