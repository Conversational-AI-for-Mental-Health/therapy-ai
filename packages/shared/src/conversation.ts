export type MessageSender = 'user' | 'ai';

export interface ConversationMessageMetadata {
  liked: boolean;
  copied: boolean;
  regenerated: boolean;
  edited: boolean;
  original_text?: string;
}

export interface ConversationMessage {
  _id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  metadata: ConversationMessageMetadata;
}

export interface Conversation {
  _id: string;
  user_id: string;
  title: string;
  started_at: string;
  last_message_at?: string;
  ended_at?: string;
  archived: boolean;
  message_count: number;
  messages?: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface AddMessageRequest {
  sender: MessageSender;
  text: string;
}
