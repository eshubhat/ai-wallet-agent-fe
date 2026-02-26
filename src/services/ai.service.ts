import { type ParsedIntent } from '../types';
import { apiClient } from './api';

export const aiService = {
    async parseNaturalLanguageIntent(intentMessage: string): Promise<ParsedIntent> {
        try {
            const provider = localStorage.getItem('ai_agent_llm_provider') || 'gemini';
            const apiKey = localStorage.getItem(`ai_agent_user_api_key_${provider}`) || localStorage.getItem('ai_agent_user_api_key');

            const res = await apiClient.post<{
                actions: any[],
                rawResponse: string
            }>('/api/agent/message', {
                message: intentMessage,
                provider: provider,
                apiKey: apiKey ? apiKey : undefined
            });

            return {
                actions: res.data.actions,
                rawResponse: res.data.rawResponse
            } as ParsedIntent;
        } catch (error: any) {
            console.error('AI Intent Parsing Error from Backend:', error);
            return {
                actions: [{
                    type: 'unknown',
                    message: error.response?.data?.error || error.message || 'Failed to parse natural language intent from backend.'
                }],
                rawResponse: error.message
            };
        }
    },

    async getChatHistory(): Promise<any[]> {
        try {
            const res = await apiClient.get<any[]>('/api/agent/history');
            return res.data;
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
            return [];
        }
    }
};
