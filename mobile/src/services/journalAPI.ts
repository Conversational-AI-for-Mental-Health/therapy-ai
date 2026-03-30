import * as SecureStore from 'expo-secure-store';
import { JournalEntry } from '../types';
import { API_URL } from '../constants/constants';

class JournalAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await SecureStore.getItemAsync('token');
    if (!token) throw new Error('Not authenticated');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/journal${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'API request failed');
    return data;
  }

  async getEntries(): Promise<JournalEntry[]> {
    const data = await this.request('');
    return data.data;
  }

  async createEntry(text: string, mood: string, moodIcon: string): Promise<JournalEntry> {
    const data = await this.request('', {
      method: 'POST',
      body: JSON.stringify({ text, mood, moodIcon }),
    });
    return data.data;
  }

  async updateEntry(id: string, text: string): Promise<JournalEntry> {
    const data = await this.request(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    });
    return data.data;
  }

  async deleteEntry(id: string): Promise<void> {
    await this.request(`/${id}`, { method: 'DELETE' });
  }
}

export default new JournalAPI();
