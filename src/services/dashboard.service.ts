import { apiClient } from './api';

export interface DashboardMetrics {
    totalTransfers: number;
    totalTransferVolume: number;
    stakes: Array<{
        stakeAccountPubkey: string;
        amount: number;
        activationState: string;
    }>;
    transfersPerContact: Array<{
        contactName: string;
        walletAddress: string;
        totalAmount: number;
        count: number;
    }>;
    transferTimeline: Array<{
        date: string;
        volume: number;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        amount: number;
        signature: string;
        date: string;
        recipient: string | null;
    }>;
    netFlow: {
        incoming: number;
        outgoing: number;
    };
}

export const dashboardService = {
    async getDashboard(): Promise<DashboardMetrics> {
        const response = await apiClient.get<DashboardMetrics>('/api/dashboard');
        return response.data;
    }
};
