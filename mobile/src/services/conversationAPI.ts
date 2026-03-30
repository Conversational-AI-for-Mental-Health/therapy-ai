import { APIResponse, Conversation } from '../types';

class ConversationAPI {

  // 🧠 Fake request (no backend)
  private async fakeDelay() {
    return new Promise(res => setTimeout(res, 800));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    await this.fakeDelay();

    // 🔥 MOCK RESPONSES BASED ON ENDPOINT
    if (endpoint.includes('/chat')) {
      const body = JSON.parse(options.body as string);
      return {
        success: true,
        data: {
          reply: `I understand you're feeling "${body.message}". Let's take a deep breath together 💙`
        } as any
      };
    }

    if (endpoint.includes('/conversations')) {
      return {
        success: true,
        data: [] as any
      };
    }

    return {
      success: true,
      data: {} as T
    };
  }

  async createConversation(title?: string): Promise<Conversation> {
    await this.fakeDelay();
    return {
      _id: Date.now().toString(),
      title: title || "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Conversation;
  }

  async getAllConversations(): Promise<Conversation[]> {
    await this.fakeDelay();
    return [];
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    await this.fakeDelay();
    return {
      _id: conversationId,
      title: "Demo Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Conversation;
  }

  async updateTitle(): Promise<Conversation> {
    await this.fakeDelay();
    return {} as Conversation;
  }

  async deleteConversation(): Promise<void> {
    await this.fakeDelay();
  }

  async sendMessage(conversationId: string | null, message: string): Promise<any> {
    const response = await this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
    });

    return response.data;
  }
}

export default new ConversationAPI();
