import { apiClient } from './api';

export interface StakeAccount {
    id: string;
    stakeAccountPubkey: string;
    amount: number;
    validatorVoteKey: string;
    activationState: string;
    activeLamports: number;
    createdAt: string;
}

export const stakeService = {
    async persistStakeAccount(data: { stakeAccountPubkey: string; validatorVoteKey: string; amount: number }): Promise<StakeAccount> {
        const response = await apiClient.post('/api/stakes', data);
        return response.data;
    },

    async getUserStakeAccounts(): Promise<StakeAccount[]> {
        const response = await apiClient.get('/api/stakes');
        return response.data;
    },

    async getStakeAccountStatus(stakeAccountPubkey: string): Promise<{ stakeAccountPubkey: string; activationState: string; activeLamports: number }> {
        const response = await apiClient.get(`/api/stakes/${stakeAccountPubkey}/status`);
        return response.data;
    }
};
