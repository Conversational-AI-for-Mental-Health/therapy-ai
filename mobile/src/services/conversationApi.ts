import { apiFetch, readJson } from './apiClient';
import { getValidToken } from './authApi';
import { APIResponse, Conversation, MobileChatResponseData, MobileConversationSummary, MobileConversationListResponse } from '../types';

class ConversationAPI {
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const token = await getValidToken();
    const res = await apiFetch(endpoint, { ...options, accessToken: token ?? undefined });
    const data = await readJson<APIResponse<T>>(res);
    if (!data) throw new Error('Empty response');
    if (!res.ok) throw new Error((data as any).error || 'API request failed');
    return data;
  }

  async createConversation(title?: string): Promise<Conversation> {
    const res = await this.fetch<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    if (!res.data) throw new Error('No data returned');
    return res.data;
  }

  async getConversationList(
    page = 1,
    pageSize = 20,
    includeArchived = false,
  ): Promise<MobileConversationListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(includeArchived ? { archived: 'true' } : {}),
    });
    const token = await getValidToken();
    const res = await apiFetch(`/conversations/mobile-list?${params}`, {
      accessToken: token ?? undefined,
    });
    const data = await readJson<MobileConversationListResponse>(res);
    if (!data) throw new Error('Empty response');
    return data;
  }

  async getConversation(
    conversationId: string,
    messageLimit = 30,
    before?: string,
  ): Promise<Conversation> {
    const params = new URLSearchParams({ limit: String(messageLimit) });
    if (before) params.set('before', before);
    const res = await this.fetch<Conversation>(
      `/conversations/${conversationId}?${params}`,
    );
    if (!res.data) throw new Error('Conversation not found');
    return res.data;
  }

  async updateTitle(conversationId: string, title: string): Promise<Conversation> {
    const res = await this.fetch<Conversation>(`/conversations/${conversationId}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
    if (!res.data) throw new Error('Failed to update title');
    return res.data;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.fetch(`/conversations/${conversationId}`, { method: 'DELETE' });
  }

  async sendMessage(
    conversationId: string | null,
    message: string,
  ): Promise<{ success: boolean; data?: MobileChatResponseData; error?: string }> {
    const token = await getValidToken();
    const res = await apiFetch('/chat/mobile', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
      accessToken: token ?? undefined,
    });
    const data = await readJson<{ success: boolean; data?: MobileChatResponseData; error?: string }>(res);
    return data ?? { success: false, error: 'Empty response' };
  }
}

export default new ConversationAPI();