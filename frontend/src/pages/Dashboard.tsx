import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { moodOptions, quickPrompts } from '@/constants/constants';
import {
  DashboardTab,
  ChatMessage,
  ChatSession,
  DashboardPageProps,
} from '@/util/types/index';

import Sidebar from '@/components/layout/Sidebar';
import Chat from '@/components/layout/Chat';
import Journal from '@/components/layout/Journal';
import Settings from '@/components/layout/Settings';
import { Menu, X } from 'lucide-react';
import logo from '../images/logo.png';import socketService from '@/util/socketService';
import conversationAPI, { Conversation, Message } from '@/util/conversationAPI';

export default function DashboardPage({
  onNavigate,
  isDarkMode,
  setIsDarkMode,
}: DashboardPageProps) {
  // UI State
  const [currentDashboardTab, setCurrentDashboardTab] =
    useState<DashboardTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Chat State
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am here to listen. How are you feeling today?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState(1);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Settings State
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // chat history reference
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Initialize Socket.io on mount
  useEffect(() => {
    socketService.connect();

    // Listen for AI responses (FIXED: correct event name)
    socketService.onAIMessage((data) => {
      console.log('Received AI message:', data);
      setChatHistory((prev) => {
        // Remove thinking indicator if present
        const withoutThinking = prev.filter((msg) => !msg.thinking);

        return [
          ...withoutThinking,
          {
            sender: 'ai',
            text: data.text,
          },
        ];
      });
    });

    // Listen for errors
    socketService.onError((error) => {
      console.error('Socket error:', error);
      setChatHistory((prev) => [
        ...prev.filter((msg) => !msg.thinking),
        {
          sender: 'ai',
          text:
            error.message || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  // Join different conversation when conversation changes
  useEffect(() => {
    if (currentConversation && socketService.isConnected()) {
      console.log('Joining conversation:', currentConversation._id);
      socketService.joinConversation(currentConversation._id);

      // Listen for conversation history
      socketService.onConversationHistory((data) => {
        console.log('Received conversation history:', data.messages.length);
        const messages: ChatMessage[] = data.messages.map((msg: Message) => ({
          sender: msg.sender,
          text: msg.text,
          feedback: null,
        }));

        // Add welcome message if no messages
        if (messages.length === 0) {
          messages.push({
            sender: 'ai',
            text: 'Hello! I am here to listen. How are you feeling today?',
          });
        }

        setChatHistory(messages);
      });
    }
  }, [currentConversation]);

  // Create initial conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsLoadingConversation(true);

        // Try to get existing conversations first
        const conversations = await conversationAPI.getAllConversations();

        if (conversations.length > 0) {
          // Load the most recent conversation
          const recent = conversations[0];
          setCurrentConversation(recent);
          setCurrentChatId(recent._id as any);

          // Load full conversation with messages
          const fullConversation = await conversationAPI.getConversation(
            recent._id,
          );

          const messages: ChatMessage[] = fullConversation.messages
            ? fullConversation.messages.map((msg: Message) => ({
                sender: msg.sender,
                text: msg.text,
                feedback: null,
              }))
            : [
                {
                  sender: 'ai',
                  text: 'Hello! I am here to listen. How are you feeling today?',
                },
              ];

          setChatHistory(messages);

          // Convert conversations to chat sessions for sidebar
          const sessions: ChatSession[] = conversations.map((conv, index) => ({
            id: index + 1,
            title: conv.title || 'Untitled Chat',
            timestamp: new Date(conv.createdAt).toLocaleDateString(),
            preview:
              conv.messages && conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].text.substring(0, 50)
                : 'No messages yet',
          }));
          setChatSessions(sessions);
        } else {
          // Create first conversation
          const conversation =
            await conversationAPI.createConversation('New Chat');
          setCurrentConversation(conversation);
          setCurrentChatId(conversation._id as any);
          setChatHistory([
            {
              sender: 'ai',
              text: 'Hello! I am here to listen. How are you feeling today?',
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        // Fallback to local state
        setChatHistory([
          {
            sender: 'ai',
            text: 'Hello! I am here to listen. How are you feeling today?',
          },
        ]);
      } finally {
        setIsLoadingConversation(false);
      }
    };

    initConversation();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Chat Handlers
  const handleQuickPrompt = (text?: string) => {
    handleChatSubmit(text);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleChatSubmit(chatInput);
  };

  const handleMessageFeedback = (
    index: number,
    feedbackType: 'positive' | 'negative',
  ) => {
    setChatHistory((prev) => {
      const newHistory = [...prev];
      if (newHistory[index]) {
        const previousFeedback = newHistory[index].feedback;

        newHistory[index] = {
          ...newHistory[index],
          feedback:
            newHistory[index].feedback === feedbackType ? null : feedbackType,
        };

        // Ask what's wrong
        if (feedbackType === 'negative' && previousFeedback !== 'negative') {
          newHistory.push({
            sender: 'ai',
            text: "I'm sorry that wasn't helpful. What went wrong? Your feedback helps me improve.",
          });
        }
      }
      return newHistory;
    });
  };

  const handleChatSubmit = async (text?: string) => {
    if (!text?.trim() || !currentConversation) return;

    // Add user message to UI immediately
    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', text },
      { sender: 'ai', text: '', thinking: true },
    ]);
    setChatInput('');

    // Send via Socket.io (will save to MongoDB and get AI response)
    try {
      socketService.sendMessage(currentConversation._id, text);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setChatHistory((prev) => [
        ...prev.filter((msg) => !msg.thinking),
        {
          sender: 'ai',
          text: 'Failed to send message. Please check your connection.',
        },
      ]);
    }
  };

  const handleNewConversation = async () => {
    try {
      const conversation = await conversationAPI.createConversation('New Chat');
      setCurrentConversation(conversation);
      setChatHistory([
        {
          sender: 'ai',
          text: 'Hello! I am here to listen. How are you feeling today?',
        },
      ]);
      setCurrentChatId(conversation._id as any);

      // Add to sidebar sessions
      const newSession: ChatSession = {
        id: chatSessions.length + 1,
        title: 'New Chat',
        timestamp: new Date().toLocaleDateString(),
        preview: 'Hello! I am here to listen...',
      };
      setChatSessions([newSession, ...chatSessions]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectChat = async (id: number) => {
    try {
      setIsLoadingConversation(true);
      setCurrentChatId(id);

      // Find conversation by ID
      const conversations = await conversationAPI.getAllConversations();
      const conversation = conversations[id - 1];

      if (conversation) {
        setCurrentConversation(conversation);

        // Load full conversation with messages
        const fullConversation = await conversationAPI.getConversation(
          conversation._id,
        );

        const messages: ChatMessage[] = fullConversation.messages
          ? fullConversation.messages.map((msg: Message) => ({
              sender: msg.sender,
              text: msg.text,
              feedback: null,
            }))
          : [
              {
                sender: 'ai',
                text: 'Hello! I am here to listen. How are you feeling today?',
              },
            ];

        setChatHistory(messages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

    const handleRenameChat = (id: number, newTitle: string) => {
        setChatSessions(prev => prev.map(session =>
            session.id === id ? { ...session, title: newTitle } : session
        ));
    };

    const handleDeleteChat = (id: number) => {
        setChatSessions(prev => {
            const updatedSessions = prev.filter(session => session.id !== id);

            // If we deleted the active chat, switch to another one
            if (currentChatId === id) {
                if (updatedSessions.length > 0) {
                    setCurrentChatId(updatedSessions[0].id);
                    // In a real app, you'd load that chat's history here
                    setChatHistory([{ sender: 'ai', text: 'Hello! I am here to listen.' }]);
                } else {
                    // If all deleted, create a fresh one
                    handleNewConversation();
                }
            }
            return updatedSessions;
        });
    };

    return (
        <>
            <div className="h-[100dvh] flex flex-col md:flex-row relative overflow-hidden">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    />
                )}

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onShowSettings={() => setShowSettingsDialog(true)}
          onNewConversation={handleNewConversation}
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNavigate={onNavigate}
                    onRenameChat={handleRenameChat}
                    onDeleteChat={handleDeleteChat}
        />

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden lg:items-center flex flex-col lg:w-1/2 md:w-full sm:w-full" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                    <div className="w-full lg:w-1/2 flex flex-col min-h-full">
                        <header className="shrink-0 flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
                            <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="flex items-center justify-center rounded-lg bg-surface shadow-sm hover:bg-primary/10 transition"
                                    style={{ width: 'var(--space-lg)', height: 'var(--space-lg)', fontSize: 'var(--font-body-lg)' }}
                                >
                                    {sidebarOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
                                </button>

                                <img
                                    src={logo}
                                    alt="Therapy AI"
                                    style={{ height: '10vh', width: 'auto', objectFit: 'contain' }}
                                />
                            </div>
                            <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="flex items-center justify-center rounded-full bg-surface shadow-sm"
                                    style={{ width: 'var(--space-lg)', height: 'var(--space-lg)', fontSize: 'var(--font-body-lg)' }}
                                >
                                    <span>{isDarkMode ? '☀️' : '🌙'}</span>
                                </button>
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="grow flex flex-col overflow-hidden">

                            <div className="shrink-0 border-b border-color" style={{ marginBottom: 'var(--space-sm)' }}>
                                <button
                                    data-tab="chat"
                                    onClick={() => setCurrentDashboardTab('chat')}
                                    className={`tab-button text-body text-secondary transition border-b-2 border-transparent ${currentDashboardTab === 'chat' ? 'active' : ''
                                        }`}
                                    style={{ padding: 'var(--space-xs) var(--space-sm)' }}
                                >
                                    Chat
                                </button>
                                <button
                                    data-tab="journal"
                                    onClick={() => setCurrentDashboardTab('journal')}
                                    className={`tab-button text-body text-secondary transition border-b-2 border-transparent ${currentDashboardTab === 'journal' ? 'active' : ''
                                        }`}
                                    style={{ padding: 'var(--space-xs) var(--space-sm)' }}
                                >
                                    Journal
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden relative flex flex-col">              {isLoadingConversation ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-secondary">Loading conversation...</div>
                </div>
              ) : (
                <>
                      {currentDashboardTab === 'chat' && (
                        <Chat
                          chatHistory={chatHistory}
                          chatHistoryRef={chatHistoryRef}
                          quickPrompts={quickPrompts}
                          chatInput={chatInput}
                          onChatInputChange={setChatInput}
                          handleQuickPrompt={handleQuickPrompt}
                          handleSubmitForm={handleSubmitForm}
                          handleMessageFeedback={handleMessageFeedback}
                        />
                      )}

                  {currentDashboardTab === 'journal' && (
                    <Journal moodOptions={moodOptions} />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Settings */}
      <Settings
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        onLogout={() => {
          setShowSettingsDialog(false);
          onNavigate('landing');
        }}
        analyticsTracking={analyticsTracking}
        setAnalyticsTracking={setAnalyticsTracking}
        personalizedAds={personalizedAds}
        setPersonalizedAds={setPersonalizedAds}
        pushNotifications={pushNotifications}
        setPushNotifications={setPushNotifications}
      />
    </>
  );
}
