const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

export interface Conversation {
  _id: string;
  user_id: string;
  title: string;
  started_at: string;
  last_message_at?: string;
  ended_at?: string;
  archived: boolean;
  deleted: boolean;
  message_count: number;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  metadata: {
    liked: boolean;
    copied: boolean;
    regenerated: boolean;
    edited: boolean;
    original_text?: string;
  };
}

class ConversationAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

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

  /**
   * Create a new conversation
   */
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

  /**
   * Get all conversations for the user
   */
  async getAllConversations(includeArchived = false): Promise<Conversation[]> {
    const response = await this.request<Conversation[]>(
      `/conversations?archived=${includeArchived}`,
    );

    return response.data || [];
  }

  /**
   * Get a single conversation with messages
   */
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

  /**
   * Add a message to a conversation
   */
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

  /**
   * Update conversation title
   */
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

  /**
   * Archive a conversation
   */
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

  /**
   * Unarchive a conversation
   */
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

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await this.request(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(conversationId: string): Promise<any> {
    const response = await this.request<any>(
      `/conversations/${conversationId}/stats`,
    );

    return response.data;
  }
}

export default new ConversationAPI();
