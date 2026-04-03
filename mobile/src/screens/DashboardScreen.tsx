import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChatMessage, ChatSession, DashboardTab, Conversation } from '../types';
import { defaultQuickPrompts } from '../constants/constants';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import conversationApi from '../services/conversationApi';
import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';
import JournalPanel from '../components/JournalPanel';
import SettingsModal from '../components/SettingsModal';
import ProfessionalSupportModal from '../components/ProfessionalSupportModal';
import { useTheme } from '../context/ThemeContext';
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'> };

export default function DashboardScreen({ navigation }: Props) {
  const { themeColors, isDarkMode, toggleDarkMode } = useTheme();
  
  const { user, logout } = useAuth();

  const [tab, setTab]= useState<DashboardTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [professionalModalOpen, setProfessionalModalOpen] = useState(false);

  
  const [chatHistory, setChatHistory] = 
  useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsHasMore, setSessionsHasMore] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(true);
  const beforeCursorRef = useRef<string | undefined>(undefined);

  
  const currentChatIdRef = useRef(currentChatId);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    loadConversations(1);
  }, []);

  const loadConversations = useCallback(async (page: number, append = false) => {
    try {
      const result = await conversationApi.getConversationList(page, 20);
      if (!result.success) return;
      const sessions: ChatSession[] = result.data.map(c => ({
        id: c._id,
        title: c.title,
        timestamp: c.last_message_at
          ? new Date(c.last_message_at).toLocaleDateString()
          : new Date(c.createdAt).toLocaleDateString(),
        preview: `${c.message_count} message${c.message_count !== 1 ? 's' : ''}`,
      }));
      setChatSessions(prev => append ? [...prev, ...sessions] : sessions);
      setSessionsPage(page);
      setSessionsHasMore(result.pagination.hasMore);
    } catch (err) {
      console.warn('[Dashboard] Could not load conversations:', err);
    }
  }, []);


  const handleLoadMoreSessions = useCallback(() => {
    if (sessionsHasMore) loadConversations(sessionsPage + 1, true);
  }, [sessionsHasMore, sessionsPage, loadConversations]);

  const handleSendMessage = async (optionalText?: string) => {
    const text = (optionalText ?? chatInput).trim();
    if (!text || isGenerating) return;
    if (!optionalText) setChatInput('');

    
    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text },
      { sender: 'ai', text: '', thinking: true },
    ]);
    setIsGenerating(true);

    try {
      const result = await conversationApi.sendMessage(currentChatIdRef.current, text);

      if (!result.success || !result.data) {
        setChatHistory(prev => {
          const filtered = prev.filter(m => !m.thinking);
          return [...filtered, { sender: 'ai', text: "I'm having trouble connecting right now. Please try again." }];
        });
        return;
      }

      const { conversationId, conversationTitle, isNewConversation, aiMessage } = result.data;

      if (isNewConversation || !currentChatIdRef.current) {
        setCurrentChatId(conversationId);
        currentChatIdRef.current = conversationId;
        const newSession: ChatSession = {
          id: conversationId,
          title: conversationTitle,
          timestamp: new Date().toLocaleDateString(),
          preview: text.substring(0, 50),
        };
        setChatSessions(prev => [newSession, ...prev.filter(s => s.id !== conversationId)]);
      }

      setChatHistory(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [...filtered, { sender: 'ai', text: aiMessage.text }];
      });

      setChatSessions(prev => prev.map(s =>
        s.id === conversationId ? { ...s, preview: aiMessage.text.substring(0, 50) } : s,
      ));
    } catch (err) {
      console.warn('[Dashboard] sendMessage error:', err);
      setChatHistory(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [...filtered, { sender: 'ai', text: "I'm having trouble connecting. Please try again." }];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
    setTimeout(() => handleSendMessage(prompt), 50);
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    setChatHistory(prev => prev.filter(m => !m.thinking));
  };

  const handleNewConversation = () => {
    if (chatHistory.length > 1 && currentChatId) {
      const firstUserMsg = chatHistory.find(m => m.sender === 'user');
      const title = firstUserMsg
        ? firstUserMsg.text.substring(0, 24) + (firstUserMsg.text.length > 24 ? '…' : '')
        : 'New conversation';
      const session: ChatSession = {
        id:        currentChatId,
        title,
        timestamp: 'Today',
        preview:   chatHistory[chatHistory.length - 1]?.text?.substring(0, 50) || '',
      };
      setChatSessions(prev => {
        const existing = prev.find(s => s.id === session.id);
        return existing ? prev : [session, ...prev];
      });
    }
    setCurrentChatId(null);
    currentChatIdRef.current = null;
    setCurrentConversation(null);
    setChatHasMore(true);
    beforeCursorRef.current = undefined;
    setChatHistory([{ sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' }]);
  };

  const handleSelectChat = async (id: string) => {
    try {
      beforeCursorRef.current = undefined;
      setChatHasMore(true);
      const conversation = await conversationApi.getConversation(id, 30);
      setCurrentChatId(id);
      currentChatIdRef.current = id;
      setCurrentConversation(conversation);
      if (conversation.messages && conversation.messages.length > 0) {
        setChatHistory(conversation.messages.map(m => ({ sender: m.sender, text: m.text })));
        beforeCursorRef.current = conversation.messages[0].timestamp;
      } else {
        setChatHistory([{ sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' }]);
      }
      setChatHasMore((conversation.messages?.length ?? 0) === 30);
    } catch (err) {
      console.warn('[Dashboard] Failed to load conversation:', err);
    }
  };


  const handleLoadOlderMessages = useCallback(async () => {
    const beforeCursor = beforeCursorRef.current;
    if (!currentChatIdRef.current || !chatHasMore) return;
    if (!beforeCursor) return;
    const PAGE_SIZE = 30;
    try {
      const older = await conversationApi.getConversation(
        currentChatIdRef.current,
        PAGE_SIZE,
        beforeCursor,
      );
      if (older.messages && older.messages.length > 0) {
        setChatHistory(prev => [
          ...older.messages!.map(m => ({ sender: m.sender, text: m.text })),
          ...prev,
        ]);
        setCurrentConversation(prev =>
          prev ? { ...prev, messages: [...(older.messages ?? []), ...(prev.messages ?? [])] } : prev,
        );
        beforeCursorRef.current = older.messages[0].timestamp;
      }
      setChatHasMore((older.messages?.length ?? 0) === PAGE_SIZE);
    } catch (err) {
      console.warn('[Dashboard] Failed to load older messages:', err);
    }
  }, [chatHasMore]);

  const handleDeleteChat = async (id: string) => {
    try {
      await conversationApi.deleteConversation(id);
      setChatSessions(prev => prev.filter(s => s.id !== id));
      if (id === currentChatId) handleNewConversation();
    } catch (err) {
      console.warn('[Dashboard] Failed to delete conversation:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const handleContactProfessional = () => {
    setSidebarOpen(false);      
    setProfessionalModalOpen(true);
  };

  const userDisplay = user
    ? { name: user.name || user.email, email: user.email }
    : undefined;

  return (
    
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={handleNewConversation}
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onContactProfessional={handleContactProfessional}
 onNavigate={(screen) => navigation.navigate(screen as any)}        onLoadMoreSessions={handleLoadMoreSessions}
        user={userDisplay}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onLogout={handleLogout}
        user={userDisplay}
      />
      <ProfessionalSupportModal
        visible={professionalModalOpen}
        onClose={() => setProfessionalModalOpen(false)}
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
          onLoadOlderMessages={handleLoadOlderMessages}
          chatHasMore={chatHasMore}
        />
      ) : (
        <JournalPanel />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 10 },
  topbarLogo: { fontSize: 22 },
  iconBtn: { padding: 6 },
  iconBtnText: { fontSize: 22, color: colors.textMuted },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingVertical: 10, paddingHorizontal: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive:{ color: colors.text },
});
