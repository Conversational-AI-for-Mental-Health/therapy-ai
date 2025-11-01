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
  currentChatId: number;      
  onSelectChat: (id: number) => void;
  onNavigate: (screen: Screens) => void;
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
};