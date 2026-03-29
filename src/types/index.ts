export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
};

export type DashboardTab = 'chat' | 'journal';

export type JournalEntry = {
  _id: string;
  createdAt: string;
  mood: string;
  moodIcon: string;
  text: string;
};

export type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
  thinking?: boolean;
  feedback?: 'positive' | 'negative' | null;
  versions?: string[];
  versionIndex?: number;
};

export type ChatSession = {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
};

export type MoodOption = {
  mood: string;
  moodIcon: string;
};

// Auth API types
export interface AuthData {
  user?: any;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: AuthData;
  message?: string;
  error?: string;
}

// Conversation types
export interface APIResponse<T> {
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
  archived: boolean;
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

export interface EmergencyRequestParams {
  userPhone?: string;
  reason?: string;
}

export interface EmergencyResponse {
  success: boolean;
  message: string;
  data?: {
    notified: boolean;
    timestamp: string;
  };
}
