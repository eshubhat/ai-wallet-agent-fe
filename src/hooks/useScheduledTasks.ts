import { useState, useCallback, useEffect } from 'react';
import { type ScheduledTask } from '../types';
import { schedulerService } from '../services/scheduler.service';
import { useSSE } from './useSSE';
import { useAuth } from '../contexts/AuthContext';

export function useScheduledTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<ScheduledTask[]>([]);
    const [triggeredTask, setTriggeredTask] = useState<ScheduledTask | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const data = await schedulerService.getUserTasks();
            setTasks(data);

            // If there's an unread triggered task in the DB, show it in the banner
            const unreadTriggered = data.find(t => t.status === 'triggered');
            if (unreadTriggered && !triggeredTask) {
                setTriggeredTask(unreadTriggered);
            }
        } catch (error) {
            console.error('Failed to fetch scheduled tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [user, triggeredTask]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Listen for live SSE triggers
    useSSE({
        enabled: !!user,
        onEvent: {
            task_triggered: (data: any) => {
                const updatedTask = data as ScheduledTask;
                // Update list
                setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, status: 'triggered' } : t));
                // Show banner
                setTriggeredTask(updatedTask);
            }
        }
    });

    const cancelTask = async (id: string) => {
        try {
            await schedulerService.cancelTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            if (triggeredTask?.id === id) setTriggeredTask(null);
        } catch (e) {
            console.error('Failed to cancel task', e);
        }
    };

    const dismissTask = async (id: string) => {
        try {
            await schedulerService.dismissTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            if (triggeredTask?.id === id) setTriggeredTask(null);
        } catch (e) {
            console.error('Failed to dismiss task', e);
        }
    };

    return {
        tasks,
        loading,
        triggeredTask,
        cancelTask,
        dismissTask,
        setTriggeredTask // expose in case UI wants to temporarily hide the banner without API call
    };
}
