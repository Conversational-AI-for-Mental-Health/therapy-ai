import { JournalEntry, JournalProps } from '@/util/types';
import React, { useState, useEffect } from 'react';
import JournalView from './RecentJournal';
import { callBackendAPI } from '@/util/api';
import ReactMarkdown from 'react-markdown';
import journalAPI from '@/util/journalAPI';

export default function Journal({
    moodOptions
}: JournalProps) {

    // Journal States
    const [selectedMood, setSelectedMood] = useState<{ mood: string; moodIcon: string } | null>(null);
    const [journalText, setJournalText] = useState('');
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [isLoadingJournal, setIsLoadingJournal] = useState(true);

    // Insights States
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [insightsContent, setInsightsContent] = useState('');
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    // Fetch journal entries on component mount
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const entries = await journalAPI.getEntries();
                setJournalEntries(entries);
            } catch (err: any) {
                setErrorMessage(err.message || 'Failed to load journal entries');
            } finally {
                setIsLoadingJournal(false);
            }
        };
        fetchEntries();
    }, []);

    const handleMoodSelect = (mood: string, moodIcon: string) => {
        setSelectedMood({ mood, moodIcon });
        setErrorMessage('');
    };

    const handleSaveEntry = async () => {
        if (!selectedMood || !journalText.trim()) {
            setErrorMessage('Please select a mood and write an entry.');
            return;
        }

        try {
            const newEntry = await journalAPI.createEntry(journalText, selectedMood.mood, selectedMood.moodIcon);
            setJournalEntries([newEntry, ...journalEntries]);
            setJournalText('');
            setSelectedMood(null);
            setErrorMessage('');
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to save entry');
        }
    };

    const handleUpdateEntry = async (id: string, newText: string) => {
        try {
            const updated = await journalAPI.updateEntry(id, newText);
            setJournalEntries(journalEntries.map(entry =>
                entry._id === id ? updated : entry
            ));
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to update entry');
        }
    };

    const handleDeleteEntry = async (id: string) => {
        try {
            await journalAPI.deleteEntry(id);
            setJournalEntries(journalEntries.filter(entry => entry._id !== id));
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to delete entry');
        }
    };

    const handleGetInsights = async (entryId: string) => {
        const entry = journalEntries.find((e) => e._id === entryId);
        if (!entry) return;

        setIsLoadingInsights(true);
        setShowInsightsModal(true);
        setInsightsContent('');

        const systemInstruction =
            'You are a gentle and supportive journal assistant. Analyze the following journal entry. In a single, encouraging paragraph, summarize the key emotions or themes you notice. Do not give advice. Frame your response as a gentle observation to help with self-reflection.';
        const insights = await callBackendAPI(entry.text, systemInstruction);

        setInsightsContent(insights);
        setIsLoadingInsights(false);
    };

    return (
        <div data-cy="journal-panel" className="h-full overflow-y-auto no-scrollbar">
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="bg-surface rounded-2xl shadow-lg" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <h2 className="text-h2">How are you feeling today?</h2>
                <p className="text-body-lg text-secondary" style={{ marginTop: 'var(--space-xxs)', marginBottom: 'var(--space-md)' }}>
                    Select a mood and write down your thoughts.
                </p>

                {/* Mood Selector */}
                <div data-cy="mood-options" className="flex items-center flex-wrap" style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    {moodOptions.map((option) => (
                        <div
                            key={option.mood}
                            data-mood={option.mood}
                            onClick={() => handleMoodSelect(option.mood, option.moodIcon)}
                            className={`mood-icon cursor-pointer bg-white/10 dark:bg-black/10 rounded-full transition-transform duration-200 ${selectedMood?.mood === option.mood ? 'selected' : ''}`}
                            style={{ fontSize: 'var(--space-lg)', padding: 'var(--space-xs)' }}
                        >
                            {option.moodIcon}
                        </div>
                    ))}
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm max-w-sm mb-4">
                        {errorMessage}
                    </div>
                )}

                {/* Journal Text Area */}
                <textarea
                    data-cy="journal-text-input"
                    value={journalText}
                    onChange={(e) => {
                        setJournalText(e.target.value);
                        if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                    placeholder="Start today's entry..."
                    style={{ height: '160px', padding: 'var(--space-sm)' }}
                />

                {/* Save Button */}
                <div className="flex justify-end" style={{ marginTop: 'var(--space-sm)' }}>
                    <button
                        onClick={handleSaveEntry}
                        className="gradient-bg-primary text-white text-body rounded-lg hover:opacity-90 transition"
                        style={{ height: '44px', padding: '0 var(--space-md)' }}
                    >
                        Save Entry
                    </button>
                </div>
            </div>

            {/* Insights Modal */}
            {showInsightsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div
                        className="bg-surface rounded-2xl shadow-xl max-w-lg w-full"
                        style={{
                            padding: 'var(--space-md)',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <h3 className="text-h2 text-surface-light" style={{ marginBottom: 'var(--space-sm)' }}>✨ Reflection on your day</h3>
                        <div
                            className="text-secondary overflow-y-auto no-scrollbar"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-sm)',
                                maxHeight: 'calc(80vh - 170px)',
                                paddingRight: '4px',
                            }}
                        >
                            {isLoadingInsights ? (
                                <div className="flex justify-center">
                                    <div className="lds-ellipsis">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                            ) : (
                                <ReactMarkdown>{insightsContent}</ReactMarkdown>
                            )}
                        </div>
                        <button
                            onClick={() => setShowInsightsModal(false)}
                            className="w-full gradient-bg-primary text-white text-body rounded-lg hover:opacity-90 transition"
                            style={{ marginTop: 'var(--space-md)', height: '44px' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Recent Entries */}
            {isLoadingJournal ? (
                <div className="flex justify-center my-10">
                    <div className="lds-ellipsis">
                        <div></div><div></div><div></div><div></div>
                    </div>
                </div>
            ) : (
                <JournalView
                    journalEntries={journalEntries}
                    onUpdateEntry={handleUpdateEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onGetInsights={handleGetInsights}
                />
            )}
        </div>
    );
};