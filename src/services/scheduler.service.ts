import { apiClient } from './api';
import { type ScheduledTask } from '../types';

export const schedulerService = {
    async createTask(data: Partial<ScheduledTask>): Promise<ScheduledTask> {
        const res = await apiClient.post<ScheduledTask>('/api/scheduler', data);
        return res.data;
    },

    async getUserTasks(): Promise<ScheduledTask[]> {
        const res = await apiClient.get<ScheduledTask[]>('/api/scheduler');
        return res.data;
    },

    async cancelTask(taskId: string): Promise<void> {
        await apiClient.delete(`/api/scheduler/${taskId}`);
    },

    async dismissTask(taskId: string): Promise<void> {
        await apiClient.patch(`/api/scheduler/${taskId}/dismiss`);
    }
};
