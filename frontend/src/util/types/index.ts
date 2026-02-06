export type Screens = 'landing' | 'login' | 'signup' | 'dashboard' | 'privacy' | 'story' | 'terms' | 'contact';
export type DashboardTab = 'chat' | 'journal';

export type JournalEntry = {
  id: number;
  date: string;
  mood: string;
  moodIcon: string;
  text: string;
};

export type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
  thinking?: boolean;
  feedback?: 'positive' | 'negative' | null;
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

export interface SignupPageProps {
  onNavigate: (screen: Screens) => void;

}

export interface ContactPageProps {
  onNavigate: (screen: Screens) => void;
}

export interface TermsPageProps {
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface DashboardPageProps{
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
};

export interface SidebarProps{
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

export interface JournalProps{
  moodOptions: MoodOption[];
};

export interface JournalViewProps {
  journalEntries: JournalEntry[];
  onUpdateEntry: (id: number, text: string) => void;
  onDeleteEntry: (id: number) => void;
  onGetInsights: (id: number) => void;
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
  isGenerating: boolean;
  onStopGeneration: () => void;
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
};
