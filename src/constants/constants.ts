export const defaultQuickPrompts = [
  'Help me relax',
  'Journal my day',
  'Recommend me books',
  'Dopamine detox',
];

export const moodOptions = [
  { mood: 'Happy', moodIcon: '😊' },
  { mood: 'Calm', moodIcon: '😌' },
  { mood: 'Sad', moodIcon: '😢' },
  { mood: 'Anxious', moodIcon: '😟' },
  { mood: 'Nervous', moodIcon: '😰' },
  { mood: 'Hopeful', moodIcon: '🌟' },
];

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';
