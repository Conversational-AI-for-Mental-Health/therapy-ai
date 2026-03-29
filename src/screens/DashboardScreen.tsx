import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, ChatMessage, ChatSession, DashboardTab, Conversation } from '../types';
import { defaultQuickPrompts } from '../constants/constants';
import { colors, spacing, radius } from '../constants/theme';

import authAPI from '../services/authAPI';
import socketService from '../services/socketService';
import conversationAPI from '../services/conversationAPI';

import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';
import JournalPanel from '../components/JournalPanel';
import SettingsModal from '../components/SettingsModal';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'> };

const AI_FAILURE_SNIPPET = "I'm having trouble connecting";

export default function DashboardScreen({ navigation }: Props) {
  const [tab, setTab] = useState<DashboardTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // User state
  const [user, setUser] = useState<{ name: string; email: string } | undefined>(undefined);

  // Refs for socket callbacks
  const currentChatIdRef = useRef(currentChatId);
  const chatHistoryRef = useRef(chatHistory);
  const generationCancelledRef = useRef(false);

  useEffect(() => { currentChatIdRef.current = currentChatId; }, [currentChatId]);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);

  // Load user & connect socket on mount
  useEffect(() => {
    const init = async () => {
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) {
        setUser({ name: currentUser.name || currentUser.email, email: currentUser.email });
      }
      await socketService.connect();
      setupSocketListeners();
      loadConversations();
    };
    init();

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.getSocket()?.on('conversation_created', (data: { conversationId: string; title: string }) => {
      setCurrentChatId(data.conversationId);
      currentChatIdRef.current = data.conversationId;
      socketService.setActiveConversation(data.conversationId);

      const newSession: ChatSession = {
        id: data.conversationId,
        title: data.title,
        timestamp: new Date().toLocaleDateString(),
        preview: 'New conversation',
      };
      setChatSessions(prev => [newSession, ...prev.filter(s => s.id !== data.conversationId)]);
    });

    socketService.onAIMessage((data) => {
      if (generationCancelledRef.current) {
        generationCancelledRef.current = false;
        return;
      }
      setIsGenerating(false);
      setChatHistory(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [...filtered, { sender: 'ai', text: data.text }];
      });

      const currentId = currentChatIdRef.current;
      if (currentId && data.text) {
        setChatSessions(prev => prev.map(s =>
          s.id === currentId ? { ...s, preview: data.text.substring(0, 50) } : s
        ));
      }
    });

    socketService.onError((error) => {
      setIsGenerating(false);
      setChatHistory(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [...filtered, { sender: 'ai', text: "I'm having trouble connecting right now. Please try again." }];
      });
    });
  };

  const loadConversations = async () => {
    try {
      const conversations = await conversationAPI.getAllConversations();
      const sessions: ChatSession[] = conversations.map(c => ({
        id: c._id,
        title: c.title,
        timestamp: new Date(c.createdAt).toLocaleDateString(),
        preview: `${c.message_count} messages`,
      }));
      setChatSessions(sessions);
    } catch (err) {
      console.warn('Could not load conversations:', err);
    }
  };

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text || isGenerating) return;
    setChatInput('');

    setChatHistory(prev => [...prev, { sender: 'user', text }, { sender: 'ai', text: '', thinking: true }]);
    setIsGenerating(true);

    try {
      socketService.sendMessage(currentChatIdRef.current, text);
    } catch (err) {
      setIsGenerating(false);
      setChatHistory(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [...filtered, { sender: 'ai', text: "I'm having trouble connecting. Please try again." }];
      });
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
    // Auto-send
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'user', text: prompt }, { sender: 'ai', text: '', thinking: true }]);
      setIsGenerating(true);
      try {
        socketService.sendMessage(currentChatIdRef.current, prompt);
      } catch {
        setIsGenerating(false);
        setChatHistory(prev => {
          const filtered = prev.filter(m => !m.thinking);
          return [...filtered, { sender: 'ai', text: "I'm having trouble connecting. Please try again." }];
        });
      }
    }, 50);
  };

  const handleStopGeneration = () => {
    generationCancelledRef.current = true;
    setIsGenerating(false);
    setChatHistory(prev => prev.filter(m => !m.thinking));
  };

  const handleNewConversation = () => {
    // Save current session snapshot if there are messages
    if (chatHistory.length > 1) {
      const firstUserMsg = chatHistory.find(m => m.sender === 'user');
      const title = firstUserMsg
        ? firstUserMsg.text.substring(0, 24) + (firstUserMsg.text.length > 24 ? '…' : '')
        : 'New conversation';
      const session: ChatSession = {
        id: currentChatId || `local-${Date.now()}`,
        title,
        timestamp: 'Today',
        preview: chatHistory[chatHistory.length - 1]?.text?.substring(0, 50) || '',
      };
      setChatSessions(prev => {
        const existing = prev.find(s => s.id === session.id);
        return existing ? prev : [session, ...prev];
      });
    }
    setCurrentChatId(null);
    setCurrentConversation(null);
    setChatHistory([{ sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' }]);
    socketService.setActiveConversation('');
  };

  const handleSelectChat = async (id: string) => {
    try {
      const conversation = await conversationAPI.getConversation(id);
      setCurrentChatId(id);
      setCurrentConversation(conversation);
      socketService.joinConversation(id);

      if (conversation.messages && conversation.messages.length > 0) {
        const msgs: ChatMessage[] = conversation.messages.map(m => ({
          sender: m.sender,
          text: m.text,
        }));
        setChatHistory(msgs);
      } else {
        setChatHistory([{ sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' }]);
      }
    } catch (err) {
      console.warn('Failed to load conversation:', err);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await conversationAPI.deleteConversation(id);
      setChatSessions(prev => prev.filter(s => s.id !== id));
      if (id === currentChatId) handleNewConversation();
    } catch (err) {
      console.warn('Failed to delete conversation:', err);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    socketService.disconnect();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={handleNewConversation}
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onContactProfessional={() => setSidebarOpen(false)}
        onNavigate={() => {}}
        user={user}
      />

      {/* Settings */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onLogout={handleLogout}
        user={user}
      />

      {/* Top Bar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topbarLogo}>🧠</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'chat' && styles.tabActive]}
          onPress={() => setTab('chat')}
        >
          <Text style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>AI Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'journal' && styles.tabActive]}
          onPress={() => setTab('journal')}
        >
          <Text style={[styles.tabText, tab === 'journal' && styles.tabTextActive]}>Journal</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === 'chat' ? (
        <ChatPanel
          chatHistory={chatHistory}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={handleSendMessage}
          onQuickPrompt={handleQuickPrompt}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
          quickPrompts={defaultQuickPrompts}
        />
      ) : (
        <JournalPanel />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  topbarLogo: { fontSize: 22 },
  iconBtn: { padding: 6 },
  iconBtnText: { fontSize: 22, color: colors.textMuted },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: colors.text },
});
