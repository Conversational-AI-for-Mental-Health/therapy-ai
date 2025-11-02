import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { moodOptions, quickPrompts } from '@/constants/constants';
import {
    DashboardTab,
    JournalEntry,
    ChatMessage,
    ChatSession,
    DashboardPageProps,
} from '@/util/types/index';

import Sidebar from '@/components/layout/Sidebar';
import Chat from '@/components/layout/Chat';
import Journal from '@/components/layout/Journal';
import { callBackendAPI } from '@/util/api';
import Settings from '@/components/layout/Settings';



export default function DashboardPage({ onNavigate, isDarkMode, setIsDarkMode }: DashboardPageProps) {

    // UI State
    const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>('chat');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [currentChatId, setCurrentChatId] = useState(1);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([
        { id: 1, title: 'Current Chat', timestamp: 'Today', preview: 'Hello! I am here to listen...' },
        { id: 2, title: 'Morning Reflection', timestamp: 'Yesterday', preview: 'Feeling anxious about work presentation...' },
        { id: 3, title: 'Evening Check-in', timestamp: '2 days ago', preview: 'Had a good day overall...' },
    ]);

    // Insights Modal State
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [insightsContent, setInsightsContent] = useState('');
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    // Settings State
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [analyticsTracking, setAnalyticsTracking] = useState(true);
    const [personalizedAds, setPersonalizedAds] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    
    // Refs
    const chatHistoryRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    //Event Handlers
    
    //Chat Handlers
    const handleQuickPrompt = (text?: string) => {
        handleChatSubmit(text);
    }
    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        handleChatSubmit(chatInput);
    }
    
    const handleChatSubmit = async (text?: string) => {
        if (!text?.trim()) return;

        setChatHistory([...chatHistory, { sender: 'user', text }, { sender: 'ai', text: '', thinking: true }]);
        setChatInput('');

        const systemInstruction =
            'You are an empathetic AI companion...';
        const response = await callBackendAPI(text, systemInstruction);

        setChatHistory((prev) => {
            const newHistory = [...prev];
            newHistory.pop();
            newHistory.push({ sender: 'ai', text: response });
            return newHistory;
        });
    };

    const handleNewConversation = () => {
        const newChatId = Math.max(...chatSessions.map(s => s.id)) + 1;
        setChatHistory([{ sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' }]);
        setCurrentChatId(newChatId);
        const newSession: ChatSession = {
            id: newChatId,
            title: 'New Chat',
            timestamp: 'Just now',
            preview: 'Hello! I am here to listen...'
        };
        setChatSessions([newSession, ...chatSessions]);
    };

    return (
        <>
            <div className="h-screen flex flex-col md:flex-row relative overflow-hidden">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    />
                )}

                {/* Left Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onShowSettings={() => setShowSettingsDialog(true)}
                    onNewConversation={handleNewConversation}
                    chatSessions={chatSessions}
                    currentChatId={currentChatId}
                    onSelectChat={setCurrentChatId}
                    onNavigate={onNavigate}
                />

                {/* Main Content Area */}
                <div className="grow flex flex-col w-full" style={{ padding: 'var(--space-sm) var(--space-md)' }}>

                    <header className="shrink-0 flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
                        <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex items-center justify-center rounded-lg bg-surface shadow-sm hover:bg-primary/10 transition"
                                style={{ width: 'var(--space-lg)', height: 'var(--space-lg)', fontSize: 'var(--font-body-lg)' }}
                            >
                                <span>{sidebarOpen ? '◀' : '▶'}</span>
                            </button>
                            <div className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
                                <span style={{ fontSize: 'var(--space-lg)' }}>🧠</span>
                                <h1 className="text-h2 text-primary hidden sm:block">Therapy AI</h1>
                            </div>
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
                                AI Chat
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


                        {currentDashboardTab === 'chat' && (
                            <Chat
                                chatHistory={chatHistory}
                                chatHistoryRef={chatHistoryRef}
                                quickPrompts={quickPrompts}
                                chatInput={chatInput}
                                onChatInputChange={setChatInput}
                                handleQuickPrompt={handleQuickPrompt}
                                handleSubmitForm={handleSubmitForm}
                            />
                        )}

                        {currentDashboardTab === 'journal' && (
                            <Journal
                                moodOptions={moodOptions}
                            />
                        )}
                    </main>
                </div>
            </div>

            {/* Modals */}
           
            {/*. Settings Dialog*/}
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
};