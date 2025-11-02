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
};

export type ChatSession = {
  id: number;
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
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface PrivacyPageProps {
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface TermsPageProps {
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export interface StoryPageProps {
  onNavigate: (screen: Screens) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}