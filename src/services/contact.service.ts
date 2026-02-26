import { apiClient } from './api';

export interface Contact {
    id: string;
    name: string;
    address: string;
}

interface BackendContact {
    id: string;
    name: string;
    walletAddress: string;
}

export const contactService = {
    async getContacts(): Promise<Contact[]> {
        try {
            const res = await apiClient.get<BackendContact[]>('/api/contacts');
            return res.data.map(c => ({
                id: c.id,
                name: c.name,
                address: c.walletAddress
            }));
        } catch (error) {
            console.error('Failed to fetch contacts', error);
            return [];
        }
    },

    async addContact(contact: Pick<Contact, 'name' | 'address'>): Promise<void> {
        try {
            await apiClient.post('/api/contacts', {
                name: contact.name,
                walletAddress: contact.address
            });
        } catch (error) {
            console.error('Failed to add contact', error);
            throw error;
        }
    },

    async removeContact(id: string): Promise<void> {
        try {
            await apiClient.delete(`/api/contacts/${id}`);
        } catch (error) {
            console.error('Failed to remove contact', error);
            throw error;
        }
    },

    async searchContacts(query: string): Promise<Contact[]> {
        if (!query) return this.getContacts();
        try {
            const res = await apiClient.get<BackendContact[]>(`/api/contacts/search?q=${encodeURIComponent(query)}`);
            return res.data.map(c => ({
                id: c.id,
                name: c.name,
                address: c.walletAddress
            }));
        } catch (error) {
            console.error('Failed to search contacts', error);
            return [];
        }
    },

    async findByName(name: string): Promise<Contact | undefined> {
        try {
            // Fetch all contacts to find by exact name, since search might be fuzzy
            const contacts = await this.getContacts();
            return contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
        } catch (error) {
            console.error('Failed to find contact by name', error);
            return undefined;
        }
    }
};
