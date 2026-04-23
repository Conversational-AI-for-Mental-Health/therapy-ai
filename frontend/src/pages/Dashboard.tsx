import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { defaultQuickPrompts, moodOptions } from '@/constants/constants';
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
import conversationAPI from '@/util/conversationAPI';
import { Conversation, Message } from '@/util/types';
import authAPI from '@/util/authAPI';
import emergencyAPI from '@/util/emergencyAPI';

const AI_SERVICE_FAILURE_SNIPPET = "I'm having trouble connecting to my AI service";

const isSuccessfulAiMessage = (msg: ChatMessage): boolean =>
    msg.sender === 'ai' &&
    !msg.thinking &&
    msg.text !== 'Hello! I am here to listen. How are you feeling today?' &&
    !msg.text.includes(AI_SERVICE_FAILURE_SNIPPET) &&
    !msg.text.includes('unable to reach the AI service');

export default function DashboardPage({
    onNavigate,
    isDarkMode,
    setIsDarkMode,
}: DashboardPageProps) {
    // UI State
    const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>('chat');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showPrompts, setShowPrompts] = useState(false);

    // Chat State
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [successfulExchangeCount, setSuccessfulExchangeCount] = useState(0);

    // Settings State
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [analyticsTracking, setAnalyticsTracking] = useState(true);
    const [personalizedAds, setPersonalizedAds] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string } | undefined>(undefined);

    // Emergency Support State
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const [isRequestingSupport, setIsRequestingSupport] = useState(false);
    const [phoneModalStatus, setPhoneModalStatus] = useState<string>('');

    const chatHistoryRef = useRef<HTMLDivElement>(null);

    // Refs to access latest state in socket callbacks
    const currentChatIdRef = useRef(currentChatId);
    const currentConversationRef = useRef(currentConversation);
    const chatHistoryStateRef = useRef(chatHistory);
    // Flag: user pressed Stop — discard the next AI response even if it arrives
    const generationCancelledRef = useRef(false);
    // Tracks where to place the AI reply when editing a message
    const pendingEditedReplyRef = useRef<{ active: boolean; aiIndex: number }>({
        active: false,
        aiIndex: -1,
    });

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

        socketService.getSocket()?.on('conversation_created', (data: { conversationId: string; title: string }) => {
            console.log('New conversation created:', data);
            setCurrentChatId(data.conversationId);
            currentChatIdRef.current = data.conversationId;

            const newConvStub: Conversation = {
                _id: data.conversationId,
                user_id: '',
                title: data.title,
                started_at: new Date().toISOString(),
                archived: false,
                message_count: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setCurrentConversation(newConvStub);
            currentConversationRef.current = newConvStub;
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
            console.log('Received AI message:', data);

            // If the user hit Stop before this arrived, discard silently
            if (generationCancelledRef.current) {
                generationCancelledRef.current = false;
                return;
            }

            const currentId = currentChatIdRef.current;

            // Update preview with AI response if we have a conversation
            if (currentId && data.text) {
                updateSessionPreview(currentId, data.text);
            }

            setChatHistory((prev) => {
                if (pendingEditedReplyRef.current.active) {
                    const updated = [...prev];
                    const targetIndex = pendingEditedReplyRef.current.aiIndex;

                    if (targetIndex >= 0 && targetIndex < updated.length) {
                        updated[targetIndex] = { sender: 'ai', text: data.text };
                    } else {
                        updated.push({ sender: 'ai', text: data.text });
                    }

                    pendingEditedReplyRef.current = { active: false, aiIndex: -1 };
                    return updated;
                }

                const withoutThinking = prev.filter((msg) => !msg.thinking);
                return [...withoutThinking, { sender: 'ai', text: data.text }];
            });

            const aiMessage: ChatMessage = { sender: 'ai', text: data.text };
            if (isSuccessfulAiMessage(aiMessage)) {
                setSuccessfulExchangeCount((prev) => prev + 1);
            }

            setIsGenerating(false);
        });

        // Handle suggested prompts from the backend
        socketService.getSocket()?.on('suggested_prompts', (data: { prompts: string[] }) => {
            if (Array.isArray(data.prompts) && data.prompts.length > 0) {
                setSuggestedPrompts(data.prompts);
            }
        });

        socketService.onError((error) => {
            console.error('Socket error:', error);
            setChatHistory((prev) => {
                if (pendingEditedReplyRef.current.active) {
                    const updated = [...prev];
                    const targetIndex = pendingEditedReplyRef.current.aiIndex;

                    if (targetIndex >= 0 && targetIndex < updated.length) {
                        updated[targetIndex] = {
                            sender: 'ai',
                            text: error.message || 'Sorry, something went wrong. Please try again.',
                        };
                    }

                    pendingEditedReplyRef.current = { active: false, aiIndex: -1 };
                    return updated;
                }

                return [
                    ...prev.filter((msg) => !msg.thinking),
                    {
                        sender: 'ai',
                        text: error.message || 'Sorry, something went wrong. Please try again.',
                    },
                ];
            });
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
            if (!authAPI.isAuthenticated()) { onNavigate('login'); return; }
            try {
                const currentUser = authAPI.getCurrentUser();
                if (currentUser) setUser(currentUser);

                setIsLoadingConversation(true);

                const conversations = await conversationAPI.getAllConversations();

                const sessions: ChatSession[] = conversations.map((conv) => ({
                    id: conv._id,
                    title: conv.title,
                    timestamp: new Date(conv.started_at || conv.createdAt).toLocaleDateString(),
                    preview: conv.message_count > 0 ? 'Open to view messages' : 'No messages yet',
                }));

                setChatSessions(sessions);

                let recentConversation = null;
                if (conversations.length > 0) {
                    const mostRecent = conversations[0];
                    const lastActive = mostRecent.last_message_at
                        ? new Date(mostRecent.last_message_at)
                        : new Date(mostRecent.started_at);
                    const now = new Date();
                    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
                    if (diffHours < 3) recentConversation = mostRecent;
                }

                if (recentConversation) {
                    await handleSelectChat(recentConversation._id);
                } else {
                    awaitStartConversation();
                }
            } catch (error) {
                console.error('Failed to initialize conversation:', error);
                awaitStartConversation();
            } finally {
                setIsLoadingConversation(false);
            }
        };

        initConversation();
    }, []);

    const awaitStartConversation = () => {
        setCurrentConversation(null);
        setCurrentChatId(null);
        setShowPrompts(false);
        setSuggestedPrompts([]);
        setSuccessfulExchangeCount(0);
        setChatHistory([
            { sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' },
        ]);
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleQuickPrompt = (text?: string) => {
        handleChatSubmit(text);
    };

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        handleChatSubmit(chatInput);
    };

    const handleMessageFeedback = (index: number, feedbackType: 'positive' | 'negative') => {
        setChatHistory((prev) => {
            const newHistory = [...prev];
            if (newHistory[index]) {
                const previousFeedback = newHistory[index].feedback;
                newHistory[index] = {
                    ...newHistory[index],
                    feedback: newHistory[index].feedback === feedbackType ? null : feedbackType,
                };
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

    const handleCopyMessage = async (index: number) => {
        const message = chatHistory[index];
        if (!message?.text) return;
        try {
            await navigator.clipboard.writeText(message.text);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    const handleEditUserMessage = (index: number, newText: string) => {
        const trimmedText = newText.trim();
        if (!trimmedText || isGenerating) return;

        let editedUserText = trimmedText;
        let targetAiIndex = -1;

        setChatHistory((prev) => {
            let lastUserIndex = -1;
            for (let i = prev.length - 1; i >= 0; i -= 1) {
                if (prev[i].sender === 'user') { lastUserIndex = i; break; }
            }

            if (index !== lastUserIndex || !prev[index] || prev[index].sender !== 'user') {
                return prev;
            }

            const updated = [...prev];
            const target = updated[index];
            targetAiIndex = index + 1;
            const versions = target.versions?.length ? [...target.versions] : [target.text];

            if (versions[versions.length - 1] !== trimmedText) {
                versions.push(trimmedText);
            }

            updated[index] = {
                ...target,
                text: trimmedText,
                versions,
                versionIndex: versions.length - 1,
            };

            editedUserText = updated[index].text;

            if (targetAiIndex >= 0 && targetAiIndex < updated.length && updated[targetAiIndex].sender === 'ai') {
                updated[targetAiIndex] = { sender: 'ai', text: '', thinking: true };
            }

            return updated;
        });

        const conversationId = currentConversation?._id || currentChatIdRef.current;
        if (!conversationId || targetAiIndex < 0) return;

        pendingEditedReplyRef.current = { active: true, aiIndex: targetAiIndex };
        setIsGenerating(true);
        setShowPrompts(false);
        setSuggestedPrompts([]);
        updateSessionPreview(conversationId, editedUserText);
        try {
            socketService.joinConversation(conversationId);
            socketService.sendMessage(conversationId, editedUserText);
        } catch (error) {
            pendingEditedReplyRef.current = { active: false, aiIndex: -1 };
            setIsGenerating(false);
            console.error('Failed to resend edited message:', error);
        }
    };

    const handleSelectUserMessageVersion = (index: number, versionIndex: number) => {
        setChatHistory((prev) => {
            if (!prev[index] || prev[index].sender !== 'user') return prev;

            const target = prev[index];
            const versions = target.versions?.length ? target.versions : [target.text];

            if (versionIndex < 0 || versionIndex >= versions.length) return prev;

            const updated = [...prev];
            updated[index] = {
                ...target,
                text: versions[versionIndex],
                versions: [...versions],
                versionIndex,
            };
            return updated;
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
            return updated.length ? updated : prev;
        });
    };

    const handleChatSubmit = async (text?: string) => {
        
        if (!text?.trim()) return;

        setChatHistory((prev) => [
            ...prev,
            { sender: 'user', text, versions: [text], versionIndex: 0 },
            { sender: 'ai', text: '', thinking: true },
        ]);
        setChatInput('');
        generationCancelledRef.current = false;
        setIsGenerating(true);
        setShowPrompts(false);

        const activeChatId = currentConversation?._id || currentChatId;
        if (activeChatId) updateSessionPreview(activeChatId, text);
        let conversationId = activeChatId || null;

        try {
            if (!conversationId) {
                const createdConversation = await conversationAPI.createConversation(
                    deriveTitleFromMessage(text),
                );
                conversationId = createdConversation._id;
                setCurrentConversation(createdConversation);
                setCurrentChatId(createdConversation._id);
                socketService.joinConversation(createdConversation._id);

                const newSession: ChatSession = {
                    id: createdConversation._id,
                    title: createdConversation.title,
                    timestamp: new Date(
                        createdConversation.started_at || createdConversation.createdAt,
                    ).toLocaleDateString(),
                    preview: text.substring(0, 80),
                };

                setChatSessions((prev) => {
                    if (prev.some((session) => session.id === createdConversation._id)) return prev;
                    return [newSession, ...prev];
                });
            }

            socketService.joinConversation(conversationId);
            socketService.sendMessage(conversationId, text);
            setSuggestedPrompts([]);
        } catch (error: any) {
            console.error('Failed to send message:', error);
            setChatHistory((prev) => [
                ...prev.filter((msg) => !msg.thinking),
                { sender: 'ai', text: 'Failed to send message. Please check your connection.' },
            ]);
            setIsGenerating(false);
        }
    };

    const handleStopGeneration = () => {
        generationCancelledRef.current = true;
        setChatHistory((prev) => prev.filter((msg) => !msg.thinking));
        setIsGenerating(false);
    };

    const handleNewConversation = async () => {
        awaitStartConversation();
    };

    const handleSelectChat = async (id: string) => {
        try {
            setIsLoadingConversation(true);
            setCurrentChatId(id);
            socketService.joinConversation(id);

            const fullConversation = await conversationAPI.getConversation(id);
            setCurrentConversation(fullConversation);

            const messages: ChatMessage[] = fullConversation.messages
                ? fullConversation.messages.map((msg: Message) => ({
                    sender: msg.sender,
                    text: msg.text,
                    feedback: null,
                    versions: msg.sender === 'user' ? [msg.text] : undefined,
                    versionIndex: msg.sender === 'user' ? 0 : undefined,
                }))
                : [{ sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' }];

            setChatHistory(messages);
            setShowPrompts(false);
            setSuggestedPrompts([]);
            setSuccessfulExchangeCount(messages.filter(isSuccessfulAiMessage).length);

            const latestMessage = messages[messages.length - 1];
            if (latestMessage && latestMessage.sender === 'ai') {
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

    const handleContactProfessional = () => {
        setShowPhoneModal(true);
    };

    const handleSendSupportRequest = async () => {
        if (isRequestingSupport) return;
        setIsRequestingSupport(true);
        setPhoneModalStatus('');
        try {
            const response = await emergencyAPI.requestProfessionalSupport({
                userPhone: userPhone.trim() || undefined,
                reason: 'User requested professional mental health support from chat interface',
            });
            if (response.success) {
                setPhoneModalStatus(response.message || 'Professional support has been notified. Someone will contact you soon.');
                setTimeout(() => {
                    setShowPhoneModal(false);
                    setUserPhone('');
                    setPhoneModalStatus('');
                }, 2500);
            } else {
                setPhoneModalStatus(response.message || 'Failed to contact support. Please try again.');
            }
        } catch (error: any) {
            console.error('Failed to contact professional:', error);
            setPhoneModalStatus('An error occurred. Please try calling 988 (Suicide & Crisis Lifeline) or 911 if this is an emergency.');
        } finally {
            setIsRequestingSupport(false);
        }
    };

    const handleSkipPhone = async () => {
        if (isRequestingSupport) return;
        setIsRequestingSupport(true);
        setPhoneModalStatus('');
        try {
            const response = await emergencyAPI.requestProfessionalSupport({
                reason: 'User requested professional mental health support from chat interface',
            });
            if (response.success) {
                setPhoneModalStatus(response.message || 'Professional support has been notified.');
                setTimeout(() => {
                    setShowPhoneModal(false);
                    setPhoneModalStatus('');
                }, 2500);
            } else {
                setPhoneModalStatus(response.message || 'Failed to contact support. Please try again.');
            }
        } catch (error: any) {
            console.error('Failed to contact professional:', error);
            setPhoneModalStatus('An error occurred. Please try calling 988 (Suicide & Crisis Lifeline) or 911 if this is an emergency.');
        } finally {
            setIsRequestingSupport(false);
        }
    };

    const shouldUseDynamicPrompts =
        successfulExchangeCount >= 2 && suggestedPrompts.length > 0;
    const quickPromptsToDisplay = shouldUseDynamicPrompts
        ? suggestedPrompts
        : defaultQuickPrompts;

    return (
        <>
            <div data-cy="dashboard-container" className="h-dvh flex flex-col md:flex-row relative overflow-hidden">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

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
                    onContactProfessional={handleContactProfessional}
                    user={user}
                />

                <div className="flex-1 overflow-hidden lg:items-center flex flex-col lg:w-1/2 md:w-full sm:w-full" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                    <div className="w-full lg:w-1/2 flex flex-col min-h-full">
                        <header className="shrink-0 flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
                            <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
                                <button
                                    data-cy="sidebar-toggle"
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
                                {socketService.isConnected() ? (
                                    <div className="flex items-center gap-1 text-green-500" title="Connected">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-caption hidden sm:inline">Connected</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-yellow-500" title="Connecting...">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        <span className="text-caption hidden sm:inline">Connecting...</span>
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

                        <main className="grow flex flex-col overflow-hidden">
                            <div className="shrink-0 border-b border-color" style={{ marginBottom: 'var(--space-sm)' }}>
                                <button
                                    data-cy="tab-chat"
                                    data-tab="chat"
                                    aria-selected={currentDashboardTab === 'chat'}
                                    onClick={() => setCurrentDashboardTab('chat')}
                                    className={`tab-button text-body text-secondary transition border-b-2 border-transparent ${currentDashboardTab === 'chat' ? 'active' : ''}`}
                                    style={{ padding: 'var(--space-xs) var(--space-sm)' }}
                                >
                                    Chat
                                </button>
                                <button
                                    data-cy="tab-journal"
                                    data-tab="journal"
                                    aria-selected={currentDashboardTab === 'journal'}
                                    onClick={() => setCurrentDashboardTab('journal')}
                                    className={`tab-button text-body text-secondary transition border-b-2 border-transparent ${currentDashboardTab === 'journal' ? 'active' : ''}`}
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
                                            showPrompts={showPrompts}
                                            onTogglePrompts={() => setShowPrompts((prev) => !prev)}
                                            quickPrompts={quickPromptsToDisplay}
                                            chatInput={chatInput}
                                            onChatInputChange={setChatInput}
                                            handleQuickPrompt={handleQuickPrompt}
                                            handleSubmitForm={handleSubmitForm}
                                            handleMessageFeedback={handleMessageFeedback}
                                            handleEditUserMessage={handleEditUserMessage}
                                            handleSelectUserMessageVersion={handleSelectUserMessageVersion}
                                            handleCopyMessage={handleCopyMessage}
                                            isGenerating={isGenerating}
                                            onStopGeneration={handleStopGeneration}
                                            onClearSuggestedPrompts={() => setSuggestedPrompts([])}
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
                setUser={setUser}
            />

            {showPhoneModal && (
                <div data-cy="phone-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" style={{ padding: 'var(--space-md)' }}>
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md" style={{ padding: 'var(--space-lg)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
                            <h3 className="text-h3 text-primary">Contact Professional Support</h3>
                            <button
                                onClick={() => setShowPhoneModal(false)}
                                className="flex items-center justify-center rounded-full hover:bg-primary/10 transition"
                                style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
                            >
                                <X size={20} className="text-secondary" />
                            </button>
                        </div>

                        <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                            A mental health professional will be notified and will contact you soon.
                        </p>

                        <div className="bg-background rounded-lg" style={{ padding: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                            <p className="text-body-sm text-secondary" style={{ marginBottom: 'var(--space-xs)' }}>
                                🚨 <strong>If this is an emergency:</strong>
                            </p>
                            <p className="text-body-sm text-secondary">
                                Call <strong>988</strong> (Suicide & Crisis Lifeline) or <strong>911</strong> immediately.
                            </p>
                        </div>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label className="text-body-sm text-secondary block" style={{ marginBottom: 'var(--space-xs)' }}>
                                Your Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className="w-full rounded-lg bg-background border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                                style={{ padding: 'var(--space-xs) var(--space-sm)' }}
                            />
                            <p className="text-caption text-secondary" style={{ marginTop: 'var(--space-xxs)' }}>
                                Providing your number helps professionals reach you faster
                            </p>
                        </div>

                        {phoneModalStatus && (
                            <div
                                className={`rounded-lg text-body-sm text-center ${phoneModalStatus.toLowerCase().includes('error') || phoneModalStatus.toLowerCase().includes('failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}
                                style={{ padding: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}
                            >
                                {phoneModalStatus}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                            <button
                                onClick={handleSkipPhone}
                                disabled={isRequestingSupport}
                                className="flex-1 bg-surface border border-color text-secondary rounded-lg hover:bg-primary/10 transition disabled:opacity-50"
                                style={{ padding: 'var(--space-xs) var(--space-sm)' }}
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSendSupportRequest}
                                disabled={isRequestingSupport}
                                className="flex-1 gradient-bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                style={{ padding: 'var(--space-xs) var(--space-sm)' }}
                            >
                                {isRequestingSupport ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}