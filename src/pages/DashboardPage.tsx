import { useState, useEffect, useCallback } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { Header } from '../components/ui/Header';
import { StakeDashboard } from '../components/stakes/StakeDashboard';
import { TransactionHistory } from '../components/transactions/TransactionHistory';
import { useAuth } from '../contexts/AuthContext';
import { stakeService, type StakeAccount } from '../services/stake.service';
import { transactionService, type Transaction } from '../services/transaction.service';
import { useSSE } from '../hooks/useSSE';
import { useScheduledTasks } from '../hooks/useScheduledTasks';
import { ScheduledTasksPanel } from '../components/scheduler/ScheduledTasksPanel';
import { NotificationBanner } from '../components/scheduler/NotificationBanner';
import { type ScheduledTask } from '../types';

export const DashboardPage = () => {
    const { user } = useAuth();
    const [stakes, setStakes] = useState<StakeAccount[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Initial data load on mount / login ──────────────────────────────────
    const fetchData = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        try {
            const [stakesData, txData] = await Promise.all([
                stakeService.getUserStakeAccounts(),
                transactionService.getUserTransactions()
            ]);
            setStakes(stakesData);
            setTransactions(txData);
        } catch (error) {
            console.error('Failed to fetch sidebar data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
        // No polling interval — SSE handles live updates
    }, [fetchData]);

    // ── Real-time updates via SSE ────────────────────────────────────────────
    useSSE({
        enabled: !!user,
        onConnected: () => {
            console.log('[SSE] Connected — live updates active');
        },
        onEvent: {
            // Upsert the new/updated stake account at the top of the list
            stakes_updated: (data) => {
                const stake = data as StakeAccount;
                setStakes(prev => [
                    stake,
                    ...prev.filter(s => s.id !== stake.id)
                ]);
            },
            // Upsert the new transaction at the top of the list
            transaction_updated: (data) => {
                const tx = data as Transaction;
                setTransactions(prev => [
                    tx,
                    ...prev.filter(t => t.id !== tx.id)
                ]);
            },
        },
    });

    // ── Scheduled Tasks ──────────────────────────────────────────────────────
    const { tasks: scheduledTasks, triggeredTask, cancelTask, dismissTask } = useScheduledTasks();

    const handleExecuteTriggeredTask = (task: ScheduledTask) => {
        // Dispatch a custom event to execute the stored payload directly
        window.dispatchEvent(new CustomEvent('ai_direct_execute', { detail: task }));
        dismissTask(task.id);
    };

    return (
        <>
            <Header />
            <main
                className="app-main"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    gap: '20px',
                    padding: '20px',
                    maxWidth: '1240px',
                    margin: '0 auto',
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                {/* Chat — grows to fill available space */}
                <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {triggeredTask && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '0 16px' }}>
                            <NotificationBanner
                                task={triggeredTask}
                                onDismiss={dismissTask}
                                onExecute={handleExecuteTriggeredTask}
                            />
                        </div>
                    )}
                    <ChatInterface />
                </div>

                {/* Sidebar — always shown when logged in */}
                {user && (
                    <div style={{
                        width: '320px',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflowY: 'auto',
                        gap: '16px',
                        paddingRight: '4px'
                    }}>
                        <ScheduledTasksPanel
                            tasks={scheduledTasks}
                            loading={loading}
                            onCancel={cancelTask}
                            onExecuteFromBanner={handleExecuteTriggeredTask}
                        />
                        <StakeDashboard stakes={stakes} loading={loading} />
                        <TransactionHistory transactions={transactions} loading={loading} />
                    </div>
                )}
            </main>
        </>
    );
};
