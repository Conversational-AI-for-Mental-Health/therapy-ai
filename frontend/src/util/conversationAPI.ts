import authAPI from './authAPI';
import { APIResponse, Conversation, Message } from './types';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ConversationAPI {
  private async fetchWithAuthRetry(
    endpoint: string,
    options: RequestInit,
  ): Promise<Response> {
    const requestOnce = async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
    };

    let response = await requestOnce();
    if (response.status === 401 && authAPI.getRefreshToken()) {
      const refreshed = await authAPI.refreshAccessToken();
      if (refreshed.success) {
        response = await requestOnce();
      }
    }
    return response;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.fetchWithAuthRetry(endpoint, options);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  //new convo
  async createConversation(title?: string): Promise<Conversation> {
    const response = await this.request<Conversation>(`/conversations`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    if (!response.data) {
      throw new Error('No data returned from API');
    }

    return response.data;
  }

  //all chats
  async getAllConversations(includeArchived = false): Promise<Conversation[]> {
    const response = await this.request<Conversation[]>(
      `/conversations?archived=${includeArchived}`,
    );

    return response.data || [];
  }
  async getConversation(
    conversationId: string,
    messageLimit = 50,
  ): Promise<Conversation> {
    const response = await this.request<Conversation>(
      `/conversations/${conversationId}?limit=${messageLimit}`,
    );

    if (!response.data) {
      throw new Error('Conversation not found');
    }

    return response.data;
  }

  async addMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string,
  ): Promise<Message> {
    const response = await this.request<{
      data: Message;
      conversationId: string;
      message_count: number;
    }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ sender, text }),
    });

    if (!response.data) {
      throw new Error('Failed to add message');
    }

    return response.data as unknown as Message;
  }

  //update title
  async updateTitle(
    conversationId: string,
    title: string,
  ): Promise<Conversation> {
    const response = await this.request<Conversation>(
      `/conversations/${conversationId}/title`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          title,
        }),
      },
    );

    if (!response.data) {
      throw new Error('Failed to update title');
    }

    return response.data;
  }

  //archive
  async archiveConversation(conversationId: string): Promise<Conversation> {
    const response = await this.request<Conversation>(
      `/conversations/${conversationId}/archive`,
      {
        method: 'PATCH',
      },
    );

    if (!response.data) {
      throw new Error('Failed to archive conversation');
    }

    return response.data;
  }

  //undo archive (coming soon)
  async unarchiveConversation(conversationId: string): Promise<Conversation> {
    const response = await this.request<Conversation>(
      `/conversations/${conversationId}/unarchive`,
      {
        method: 'PATCH',
      },
    );

    if (!response.data) {
      throw new Error('Failed to unarchive conversation');
    }

    return response.data;
  }

  //delete
  async deleteConversation(conversationId: string): Promise<void> {
    await this.request(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  //stats?
  async getConversationStats(conversationId: string): Promise<any> {
    const response = await this.request<any>(
      `/conversations/${conversationId}/stats`,
    );

    return response.data;
  }
}

export default new ConversationAPI();
