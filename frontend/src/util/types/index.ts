// Define TypeScript types for the Therapy AI application
export type Screens = 'landing' | 'login' | 'signup' | 'dashboard' | 'privacy' | 'story' | 'terms' | 'contact' | 'reset-password' | 'notfound';
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
  suggestedPrompts?: string[];
};

export type ChatSession = {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
};

export interface LandingPageProps {
  onNavigate: (screen: Screens) => void;
  handleChatSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  chatInput: string;
  setChatInput: (value: string) => void;
}

export interface LoginPageProps {
  onNavigate: (screen: Screens) => void;

}

export interface ResetPasswordPageProps {
  onNavigate: (screen: Screens) => void;
}

export interface SignupPageProps {
  onNavigate: (screen: Screens) => void;

}

export interface ContactPageProps {
  onNavigate: (screen: Screens) => void;
}

export interface ResetPasswordPageProps {
  onNavigate: (screen: Screens) => void;
}

export interface TermsPageProps {
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface DashboardPageProps {
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
};

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSettings: () => void;
  onNewConversation: () => void;
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNavigate: (screen: Screens) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  onContactProfessional: () => void;
  user?: {
    name: string;
    email: string;
  };
};

export type MoodOption = {
  mood: string;
  moodIcon: string;
};

export interface JournalProps {
  moodOptions: MoodOption[];
};

export interface JournalViewProps {
  journalEntries: JournalEntry[];
  onUpdateEntry: (id: string, text: string) => void;
  onDeleteEntry: (id: string) => void;
  onGetInsights: (id: string) => void;
}

export interface ChatProps {
  chatHistory: ChatMessage[];
  chatHistoryRef: React.RefObject<HTMLDivElement>;
  quickPrompts: string[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  handleQuickPrompt: (text?: string) => void;
  handleSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
  handleMessageFeedback: (index: number, feedbackType: 'positive' | 'negative') => void;
  handleEditUserMessage: (index: number, newText: string) => void;
  handleSelectUserMessageVersion: (index: number, versionIndex: number) => void;
  handleCopyMessage: (index: number) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  suggestedPrompts: string[];
  onClearSuggestedPrompts: () => void;
};

export interface FeedbackProps {
  isOpen: boolean;
  onClose: () => void;
};

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  analyticsTracking: boolean;
  setAnalyticsTracking: (value: boolean) => void;
  personalizedAds: boolean;
  setPersonalizedAds: (value: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  user?: {
    name: string;
    email: string;
  };
  setUser?: (user: { name: string; email: string } | undefined) => void;
};

//Auth API types
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

//Conversation API types
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
  ended_at?: string;
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

//Emergency API types
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