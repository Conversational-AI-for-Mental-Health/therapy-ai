import { apiFetch, readJson } from './apiClient';
import { getValidToken } from './authApi';
import { JournalEntry } from '../types';

class JournalAPI {
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getValidToken();
    if (!token) throw new Error('Not authenticated');
    const res  = await apiFetch(`/journal${endpoint}`, { ...options, accessToken: token });
    const data = await readJson<{ success: boolean; data?: T; error?: string }>(res);
    if (!res.ok || !data?.success) throw new Error(data?.error || 'API request failed');
    return data.data as T;
  }

  async getEntries(): Promise<JournalEntry[]> {
    return this.fetch<JournalEntry[]>('');
  }

  async createEntry(text: string, mood: string, moodIcon: string): Promise<JournalEntry> {
    return this.fetch<JournalEntry>('', {
      method: 'POST',
      body: JSON.stringify({ text, mood, moodIcon }),
    });
  }

  async updateEntry(id: string, text: string): Promise<JournalEntry> {
    return this.fetch<JournalEntry>(`/${id}`, {
      method: 'PATCH',
      body:   JSON.stringify({ text }),
    });
  }

  async deleteEntry(id: string): Promise<void> {
    await this.fetch<void>(`/${id}`, { method: 'DELETE' });
  }
}

export default new JournalAPI();
