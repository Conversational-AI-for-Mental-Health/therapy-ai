// Handle all API interactions related to journal entries
import { JournalEntry } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
// Journal API class
class JournalAPI {
    // Helper method to make authenticated API requests
    private async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
            Authorization: `Bearer ${token}`,
        };

        const response = await fetch(`${API_URL}/journal${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    }
    // Get all journal entries for the authenticated user
    async getEntries(): Promise<JournalEntry[]> {
        const data = await this.request('');
        return data.data;
    }

    // Create a new journal entry
    async createEntry(text: string, mood: string, moodIcon: string): Promise<JournalEntry> {
        const data = await this.request('', {
            method: 'POST',
            body: JSON.stringify({ text, mood, moodIcon }),
        });
        return data.data;
    }

    // Update an existing journal entry
    async updateEntry(id: string, text: string): Promise<JournalEntry> {
        const data = await this.request(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ text }),
        });
        return data.data;
    }

    // Delete a journal entry
    async deleteEntry(id: string): Promise<void> {
        await this.request(`/${id}`, {
            method: 'DELETE',
        });
    }
}

export default new JournalAPI();
