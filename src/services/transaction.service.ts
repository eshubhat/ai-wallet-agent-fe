import { apiClient } from './api';

export interface Transaction {
    id: string;
    signature: string;
    type: string;
    amount: number;
    token?: string;
    recipient?: string;
    status: string;
    createdAt: string;
}

export const transactionService = {
    async getUserTransactions(): Promise<Transaction[]> {
        const response = await apiClient.get<Transaction[]>('/api/transactions');
        return response.data;
    },

    async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
        const response = await apiClient.post<Transaction>('/api/transactions', data);
        return response.data;
    }
};
