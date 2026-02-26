import { apiClient } from './api';

export interface User {
    id: string;
    email: string;
    name: string | null;
    walletAddress: string | null;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    async signup(data: { email: string; password: string; name?: string; walletAddress?: string }): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
        return response.data;
    },

    async signin(data: { email: string; password: string }): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/signin', data);
        return response.data;
    },

    async googleLogin(idToken: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/google', { idToken });
        return response.data;
    },
};
