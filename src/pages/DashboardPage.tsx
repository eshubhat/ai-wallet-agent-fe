import { useState, useEffect } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { Header } from '../components/ui/Header';
import { StakeDashboard } from '../components/stakes/StakeDashboard';
import { TransactionHistory } from '../components/transactions/TransactionHistory';
import { useAuth } from '../contexts/AuthContext';
import { stakeService, type StakeAccount } from '../services/stake.service';
import { transactionService, type Transaction } from '../services/transaction.service';

export const DashboardPage = () => {
    const { user } = useAuth();
    const [stakes, setStakes] = useState<StakeAccount[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchSidebarData = async () => {
            try {
                const [stakesData, txData] = await Promise.all([
                    stakeService.getUserStakeAccounts(),
                    transactionService.getUserTransactions()
                ]);
                setStakes(stakesData);
                setTransactions(txData);
            } catch (error) {
                console.error('Failed to fetch sidebar layout data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSidebarData();
        const intervalId = setInterval(fetchSidebarData, 30000);
        return () => clearInterval(intervalId);
    }, [user]);

    const hasSidebarData = loading || stakes.length > 0 || transactions.length > 0;
    const showSidebar = user && hasSidebarData;

    return (
        <>
            <Header />
            <main className="app-main" style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: showSidebar ? 'flex-start' : 'center',
                gap: '20px',
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                overflow: 'hidden'
            }}>
                <div style={{
                    flex: showSidebar ? 1 : 'none',
                    width: showSidebar ? 'auto' : '100%',
                    maxWidth: showSidebar ? 'none' : '800px',
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: showSidebar ? '0' : '0 auto'
                }}>
                    <ChatInterface />
                </div>
                {showSidebar && (
                    <div style={{ width: '350px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '20px', paddingRight: '8px' }}>
                        <StakeDashboard stakes={stakes} loading={loading} />
                        <TransactionHistory transactions={transactions} loading={loading} />
                    </div>
                )}
            </main>
        </>
    );
};
