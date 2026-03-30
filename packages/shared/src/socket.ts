export interface JoinConversationEvent {
  conversationId: string;
  userId: string;
}

export interface SendMessageEvent {
  conversationId: string;
  text: string;
  userId: string;
}

export interface ReceiveMessageEvent {
  conversationId: string;
  text: string;
  sender: 'ai';
  timestamp: string;
}

export interface ConversationHistoryEvent {
  conversationId: string;
  messages: Array<{
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
}
