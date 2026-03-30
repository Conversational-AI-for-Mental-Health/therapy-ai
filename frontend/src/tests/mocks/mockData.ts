import { ChatMessage, JournalEntry, ChatSession } from '@/util/types';
import type { Conversation } from '@/util/types';

export const mockChatMessages: ChatMessage[] = [
  {
    sender: 'ai',
    text: 'Hello! I am here to listen. How are you feeling today?',
  },
  {
    sender: 'user',
    text: 'I am feeling a bit anxious today.',
  },
  {
    sender: 'ai',
    text: 'I understand. Anxiety can be difficult. Would you like to talk about what is making you anxious?',
  },
];

export const mockThinkingMessage: ChatMessage = {
  sender: 'ai',
  text: '',
  thinking: true,
};

export const mockJournalEntries: JournalEntry[] = [
  {
    _id: '1',
    createdAt: '2025-11-28T10:00:00Z',
    mood: 'Happy',
    moodIcon: '😊',
    text: 'Today was a great day! I felt productive and accomplished many of my goals. I am grateful for the support of my friends and family.',
  },
  {
    _id: '2',
    createdAt: '2025-11-27T10:00:00Z',
    mood: 'Anxious',
    moodIcon: '😟',
    text: 'Feeling overwhelmed with work deadlines. There is so much to do and I am not sure where to start. Need to take a deep breath and prioritize my tasks one at a time.',
  },
  {
    _id: '3',
    createdAt: '2025-11-26T10:00:00Z',
    mood: 'Calm',
    moodIcon: '😌',
    text: 'This is a short entry with less than 100 words for testing the insights feature validation.',
  },
];

export const mockLongJournalEntry: JournalEntry = {
  _id: '4',
  createdAt: '2025-11-25T10:00:00Z',
  mood: 'Hopeful',
  moodIcon: '🌟',
  text: 'Today was a good day overall. I woke up feeling refreshed and ready to tackle my tasks. The morning started with a peaceful walk in the park, which helped clear my mind and set a positive tone for the rest of the day. I noticed the changing leaves and took a moment to appreciate the beauty around me. Work was productive, and I managed to complete several important tasks that had been pending. I felt accomplished and proud of myself. In the evening, I spent quality time with family, which always lifts my spirits. We shared stories and laughed together, reminding me of the importance of connection. I am grateful for these moments and looking forward to more days like this.',
};

export const mockChatSessions: ChatSession[] = [
  {
    id: '1',
    title: 'Anxiety Discussion',
    timestamp: 'Nov 28, 2025',
    preview: 'I am feeling a bit anxious today...',
  },
  {
    id: '2',
    title: 'Morning Check-in',
    timestamp: 'Nov 27, 2025',
    preview: 'Good morning! How are you feeling?',
  },
  {
    id: '3',
    title: 'Evening Reflection',
    timestamp: 'Nov 26, 2025',
    preview: 'Today was challenging but I made it through...',
  },
];

export const mockConversation: Conversation = {
  _id: '507f1f77bcf86cd799439011',
  user_id: '507f1f77bcf86cd799439011',
  title: 'Test Conversation',
  started_at: '2025-11-28T10:00:00Z',
  last_message_at: '2025-11-28T10:30:00Z',
  archived: false,
  message_count: 3,
  createdAt: '2025-11-28T10:00:00Z',
  updatedAt: '2025-11-28T10:30:00Z',
  messages: [
    {
      _id: '1',
      sender: 'ai',
      text: 'Hello! How can I help you today?',
      timestamp: '2025-11-28T10:00:00Z',
      metadata: {
        liked: false,
        copied: false,
        regenerated: false,
        edited: false,
      },
    },
    {
      _id: '2',
      sender: 'user',
      text: 'I need some advice',
      timestamp: '2025-11-28T10:15:00Z',
      metadata: {
        liked: false,
        copied: false,
        regenerated: false,
        edited: false,
      },
    },
  ],
};

export const mockConversations: Conversation[] = [
  mockConversation,
  {
    ...mockConversation,
    _id: '507f1f77bcf86cd799439012',
    title: 'Second Conversation',
    message_count: 1,
  },
];

export const mockMoodOptions = [
  { mood: 'Happy', moodIcon: '😊' },
  { mood: 'Calm', moodIcon: '😌' },
  { mood: 'Sad', moodIcon: '😢' },
  { mood: 'Anxious', moodIcon: '😟' },
  { mood: 'Nervous', moodIcon: '😰' },
  { mood: 'Hopeful', moodIcon: '🌟' },
];

export const mockSuggestedPrompts = [
  'Help me relax',
  'Journal my day',
  'Recommend me books',
  'Dopamine detox',
];

export const mockAIResponse = {
  aiResponse:
    'Thank you for sharing that. It sounds like you are going through a challenging time. Would you like to explore some coping strategies?',
};

export const mockErrorResponse = {
  error: 'Failed to process request',
};

export const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};
