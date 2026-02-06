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
import logo from '../images/logo.png'; import socketService from '@/util/socketService';
import conversationAPI, { Conversation, Message } from '@/util/conversationAPI';
import authAPI from '@/util/authAPI';

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
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Settings State
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [analyticsTracking, setAnalyticsTracking] = useState(true);
    const [personalizedAds, setPersonalizedAds] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string } | undefined>(undefined);

    // chat history reference
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    // Refs to access latest state in socket callbacks
    const currentChatIdRef = useRef(currentChatId);
    const currentConversationRef = useRef(currentConversation);
    const chatHistoryStateRef = useRef(chatHistory);

    useEffect(() => {
        currentChatIdRef.current = currentChatId;
        currentConversationRef.current = currentConversation;
        chatHistoryStateRef.current = chatHistory;
    }, [currentChatId, currentConversation, chatHistory]);

    const deriveTitleFromMessage = (text: string) => {
        const maxLength = 20;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    // Socket.io
    useEffect(() => {
        socketService.connect();
        socketService.onAIMessage((data) => {
            console.log('Received AI message:', data);

            const currentId = currentChatIdRef.current;
            const currentConv = currentConversationRef.current;
            const history = chatHistoryStateRef.current;

            // Check if we need to set up a new conversation state
            if ((!currentId || !currentConv) && data.conversationId) {
                const newConversationId = data.conversationId;
                // Only create new session if we don't have this ID yet
                if (currentId !== newConversationId) {
                    setCurrentChatId(newConversationId);
                    currentChatIdRef.current = newConversationId;

                    // Find the user's first message to generate title (backend also does this)
                    const userMsg = history.find(m => m.sender === 'user');
                    const generatedTitle = userMsg ? deriveTitleFromMessage(userMsg.text) : 'New Conversation';

                    // Create conversation stub with generated title - backend has same logic
                    const newConvStub: Conversation = {
                        _id: newConversationId,
                        user_id: '',
                        title: generatedTitle,
                        started_at: new Date().toISOString(),
                        archived: false,
                        message_count: 2, // User + AI
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    setCurrentConversation(newConvStub);

                    const newSession: ChatSession = {
                        id: newConversationId,
                        title: generatedTitle,
                        timestamp: new Date().toLocaleDateString(),
                        preview: data.text.substring(0, 80),
                    };

                    setChatSessions(prev => {
                        if (prev.some(s => s.id === newConversationId)) return prev;
                        return [newSession, ...prev];
                    });
                }
            } else if (currentId && data.text) {
                //update preview with AI response
                updateSessionPreview(currentId, data.text);
            }

            setChatHistory((prev) => {
                const withoutThinking = prev.filter((msg) => !msg.thinking);

                return [
                    ...withoutThinking,
                    {
                        sender: 'ai',
                        text: data.text,
                    },
                ];
            });
            setIsGenerating(false);
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
            setIsGenerating(false);
        });

        return () => {
            socketService.removeAllListeners();
            socketService.disconnect();
        };
    }, []);

    // Create initial conversation or load most recent one
    useEffect(() => {
        const initConversation = async () => {
            try {
                const currentUser = authAPI.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                }

                setIsLoadingConversation(true);

                // try to get existing conversations first
                const conversations = await conversationAPI.getAllConversations();

                //convert conversations to chat sessions for sidebar
                const sessions: ChatSession[] = conversations.map((conv) => ({
                    id: conv._id,
                    title: conv.title,
                    timestamp: new Date(conv.started_at || conv.createdAt).toLocaleDateString(),
                    preview:
                        conv.message_count > 0
                            ? 'Open to view messages'
                            : 'No messages yet',
                }));

                setChatSessions(sessions);

                // Check for a recent conversation (less than 3 hours old)
                let recentConversation = null;
                if (conversations.length > 0) {
                    const mostRecent = conversations[0]; // Assuming sorted by date descending from API
                    const lastActive = mostRecent.last_message_at ? new Date(mostRecent.last_message_at) : new Date(mostRecent.started_at);
                    const now = new Date();
                    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

                    if (diffHours < 3) {
                        recentConversation = mostRecent;
                    }
                }

                if (recentConversation) {
                    // load the recent conversation
                    await handleSelectChat(recentConversation._id);
                } else {
                    // start a fresh conversation (not saved to DB yet)
                    awaitStartConversation();
                }

            } catch (error) {
                console.error('Failed to initialize conversation:', error);
                // fallback to local state
                awaitStartConversation();
            } finally {
                setIsLoadingConversation(false);
            }
        };

        initConversation();
    }, []);

    const awaitStartConversation = () => {
        setCurrentConversation(null); // No ID yet
        setCurrentChatId(null);
        setChatHistory([
            {
                sender: 'ai',
                text: 'Hello! I am here to listen. How are you feeling today?',
            },
        ]);
    };

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

    const updateSessionPreview = (chatId: string, previewText: string) => {
        setChatSessions((prev) => {
            const updated = prev.map((session) =>
                session.id === chatId
                    ? {
                        ...session,
                        preview: previewText.substring(0, 80),
                        timestamp: new Date().toLocaleDateString(),
                    }
                    : session,
            );

            // If session not found, return original array
            return updated.length ? updated : prev;
        });
    };

    const handleChatSubmit = async (text?: string) => {
        if (!text?.trim()) return;

        // Add user message to UI immediately
        setChatHistory((prev) => [
            ...prev,
            { sender: 'user', text },
            { sender: 'ai', text: '', thinking: true },
        ]);
        setChatInput('');
        setIsGenerating(true);

        // If we have an active conversation, update preview
        const activeChatId = currentConversation?._id || currentChatId;

        if (activeChatId) {
            updateSessionPreview(activeChatId, text);
        }
        const conversationId = activeChatId || null;

        try {
            socketService.sendMessage(conversationId, text);
        } catch (error: any) {
            console.error('Failed to send message:', error);
            setChatHistory((prev) => [
                ...prev.filter((msg) => !msg.thinking),
                {
                    sender: 'ai',
                    text: 'Failed to send message. Please check your connection.',
                },
            ]);
            setIsGenerating(false);
        }
    };

    const handleStopGeneration = () => {
        // Remove thinking message and stop generation
        setChatHistory((prev) => prev.filter((msg) => !msg.thinking));
        setIsGenerating(false);
        // Optionally disconnect/reconnect socket to stop server-side processing
        socketService.disconnect();
        socketService.connect();
    };

    const handleNewConversation = async () => {
        // reset state
        awaitStartConversation();
    };

    const handleSelectChat = async (id: string) => {
        try {
            setIsLoadingConversation(true);
            setCurrentChatId(id);

            const fullConversation = await conversationAPI.getConversation(id);
            setCurrentConversation(fullConversation);

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

            // Update the preview to show the latest message
            const latestMessage = messages[messages.length - 1];
            if (latestMessage && latestMessage.sender == 'ai') {
                updateSessionPreview(id, latestMessage.text);
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
        } finally {
            setIsLoadingConversation(false);
        }
    };

    const handleRenameChat = async (id: string, newTitle: string) => {
        try {
            const updated = await conversationAPI.updateTitle(id, newTitle);
            // Update current conversation if it matches
            setCurrentConversation((prev) =>
                prev && prev._id === id ? { ...prev, title: updated.title } : prev,
            );

            setChatSessions((prev) =>
                prev.map((session) =>
                    session.id === id ? { ...session, title: updated.title } : session,
                ),
            );
        } catch (error) {
            console.error('Failed to rename conversation:', error);
        }
    };

    const handleDeleteChat = async (id: string) => {
        try {
            await conversationAPI.deleteConversation(id);
            setChatSessions((prev) => {
                const updatedSessions = prev.filter((session) => session.id !== id);

                // If we deleted the active chat, switch to another one
                if (currentChatId === id) {
                    if (updatedSessions.length > 0) {
                        const next = updatedSessions[0];
                        setCurrentChatId(next.id);
                        handleSelectChat(next.id);
                    } else {
                        handleNewConversation();
                    }
                }
                return updatedSessions;
            });
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    return (
        <>
            <div className="h-dvh flex flex-col md:flex-row relative overflow-hidden">
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
                    user={user}
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
                                {/* Socket Connection Status */}
                                {socketService.isConnected() ? (
                                    <div
                                        className="flex items-center gap-1 text-green-500"
                                        title="Connected"
                                    >
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-caption hidden sm:inline">
                                            Connected
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-1 text-yellow-500"
                                        title="Connecting..."
                                    >
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        <span className="text-caption hidden sm:inline">
                                            Connecting...
                                        </span>
                                    </div>
                                )}
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

                            {isLoadingConversation ? (
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
                                            isGenerating={isGenerating}
                                            onStopGeneration={handleStopGeneration}
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
                    authAPI.logout();
                    setShowSettingsDialog(false);
                    onNavigate('landing');
                }}
                analyticsTracking={analyticsTracking}
                setAnalyticsTracking={setAnalyticsTracking}
                personalizedAds={personalizedAds}
                setPersonalizedAds={setPersonalizedAds}
                pushNotifications={pushNotifications}
                setPushNotifications={setPushNotifications}
                user={user}
            />
        </>
    );
}
