import { useState, useEffect } from 'react';
import { Header } from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, type DashboardMetrics } from '../../services/dashboard.service';
import {
    LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, Wallet, Layers, ArrowRightLeft, TrendingUp, PieChart as PieChartIcon, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

const STAKE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

export const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchDashboard = async () => {
            try {
                const data = await dashboardService.getDashboard();
                setMetrics(data);
            } catch (error) {
                console.error('Failed to fetch analytics dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user]);

    if (!user) return null;

    return (
        <>
            <Header />
            <main className="app-main" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto', height: '100%' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text)' }}>Wallet Analytics</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Overview of your autonomous agent's activity</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : (
                    <>
                        {/* Dashboard Bento Box Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(12, 1fr)',
                            gap: '20px',
                            marginBottom: '30px',
                            alignItems: 'start'
                        }}>

                            {/* Top Metrics Row - Spans 3 columns each */}
                            <div style={{ gridColumn: 'span 3' }}>
                                <MetricCard title="Total Transfers" value={metrics?.totalTransfers.toString() || '0'} icon={<Activity size={20} color="#3b82f6" />} />
                            </div>
                            <div style={{ gridColumn: 'span 3' }}>
                                <MetricCard title="Total Volume" value={`${metrics?.totalTransferVolume.toFixed(2) || 0} SOL`} icon={<Wallet size={20} color="#10b981" />} />
                            </div>
                            <div style={{ gridColumn: 'span 3' }}>
                                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
                                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                                        <ArrowDownRight size={20} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>Incoming Flow</p>
                                        <h3 style={{ color: 'var(--text)', fontSize: '1.25rem', margin: 0 }}>+{metrics?.netFlow?.incoming?.toFixed(2) || 0} SOL</h3>
                                    </div>
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 3' }}>
                                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
                                    <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '12px', color: '#f43f5e' }}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>Outgoing Flow</p>
                                        <h3 style={{ color: 'var(--text)', fontSize: '1.25rem', margin: 0 }}>-{metrics?.netFlow?.outgoing?.toFixed(2) || 0} SOL</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '20px', borderRadius: '16px', height: '100%' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <TrendingUp size={16} /> Transfer Volume Timeline
                                </h3>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer>
                                        <LineChart data={metrics?.transferTimeline || []} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '20px', borderRadius: '16px', height: '100%' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <PieChartIcon size={16} /> Staking Distribution
                                </h3>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={metrics?.stakes || []}
                                                dataKey="amount"
                                                nameKey="stakeAccountPubkey"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                            >
                                                {metrics?.stakes.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STAKE_COLORS[index % STAKE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value: any, name: any) => {
                                                    const strName = String(name);
                                                    return [`${Number(value).toFixed(2)} SOL`, `${strName.slice(0, 4)}...${strName.slice(-4)}`];
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Tables Section */}
                            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '16px', borderRadius: '16px', overflowY: 'auto', maxHeight: '350px' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <Clock size={16} /> Recent Activity
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {metrics?.recentActivity?.map((activity, idx) => (
                                        <div key={idx} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{
                                                    padding: '6px',
                                                    borderRadius: '8px',
                                                    background: activity.type === 'transfer' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: activity.type === 'transfer' ? '#f43f5e' : '#10b981'
                                                }}>
                                                    {activity.type === 'transfer' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                                        {activity.type}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {format(new Date(activity.date), 'MMM dd, HH:mm')}
                                                        {activity.recipient && ` • To: ${activity.recipient.slice(0, 6)}...`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text)', fontSize: '0.9rem' }}>
                                                {activity.amount.toFixed(2)} SOL
                                            </div>
                                        </div>
                                    ))}
                                    {(!metrics?.recentActivity || metrics.recentActivity.length === 0) && (
                                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
                                            No recent activity found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '16px', borderRadius: '16px', overflowY: 'auto', maxHeight: '350px' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <Layers size={16} /> Active Stakes
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        <div>Account</div>
                                        <div style={{ textAlign: 'right' }}>Amount</div>
                                        <div style={{ textAlign: 'center' }}>State</div>
                                    </div>
                                    {metrics?.stakes.map((stake, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', alignItems: 'center' }}>
                                            <div style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {stake.stakeAccountPubkey.slice(0, 4)}..{stake.stakeAccountPubkey.slice(-3)}
                                            </div>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.85rem' }}>
                                                {stake.amount.toFixed(2)}
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', textTransform: 'capitalize' }}>
                                                    {stake.activationState}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!metrics?.stakes || metrics.stakes.length === 0) && (
                                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
                                            No active stakes found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '16px', borderRadius: '16px', overflowY: 'auto', maxHeight: '350px' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <ArrowRightLeft size={16} /> Contacts Ledger
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', padding: '0 8px', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        <div>Recipient</div>
                                        <div style={{ textAlign: 'center' }}>Tx</div>
                                        <div style={{ textAlign: 'right' }}>Vol</div>
                                    </div>
                                    {metrics?.transfersPerContact.map((contact, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', padding: '10px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', alignItems: 'center' }}>
                                            <div style={{ color: 'var(--text)', fontWeight: '500', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={contact.contactName}>
                                                {contact.contactName !== contact.walletAddress
                                                    ? contact.contactName
                                                    : `${contact.contactName.slice(0, 4)}..${contact.contactName.slice(-3)}`}
                                            </div>
                                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {contact.count}
                                            </div>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.85rem' }}>
                                                {contact.totalAmount.toFixed(1)}
                                            </div>
                                        </div>
                                    ))}
                                    {(!metrics?.transfersPerContact || metrics.transfersPerContact.length === 0) && (
                                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>
                                            No transfers found.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </main>
        </>
    );
};

const MetricCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px', margin: 0 }}>{title}</p>
            <h3 style={{ color: 'var(--text)', fontSize: '1.25rem', margin: 0 }}>{value}</h3>
        </div>
    </div>
);
