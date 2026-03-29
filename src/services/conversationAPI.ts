import * as SecureStore from 'expo-secure-store';
import authAPI from './authAPI';
import { APIResponse, Conversation, Message } from '../types';
import { API_URL } from '../constants/constants';

class ConversationAPI {
  private async fetchWithAuthRetry(endpoint: string, options: RequestInit): Promise<Response> {
    const requestOnce = async () => {
      const token = await SecureStore.getItemAsync('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(`${API_URL}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers as any) } });
    };

    let response = await requestOnce();
    if (response.status === 401 && (await authAPI.getRefreshToken())) {
      const refreshed = await authAPI.refreshAccessToken();
      if (refreshed.success) response = await requestOnce();
    }
    return response;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await this.fetchWithAuthRetry(endpoint, options);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API request failed');
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  async createConversation(title?: string): Promise<Conversation> {
    const response = await this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    if (!response.data) throw new Error('No data returned from API');
    return response.data;
  }

  async getAllConversations(includeArchived = false): Promise<Conversation[]> {
    const response = await this.request<Conversation[]>(`/conversations?archived=${includeArchived}`);
    return response.data || [];
  }

  async getConversation(conversationId: string, messageLimit = 50): Promise<Conversation> {
    const response = await this.request<Conversation>(`/conversations/${conversationId}?limit=${messageLimit}`);
    if (!response.data) throw new Error('Conversation not found');
    return response.data;
  }

  async updateTitle(conversationId: string, title: string): Promise<Conversation> {
    const response = await this.request<Conversation>(`/conversations/${conversationId}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
    if (!response.data) throw new Error('Failed to update title');
    return response.data;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.request(`/conversations/${conversationId}`, { method: 'DELETE' });
  }

  async sendMessage(conversationId: string | null, message: string): Promise<any> {
    const response = await this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
    });
    return response;
  }
}

export default new ConversationAPI();
