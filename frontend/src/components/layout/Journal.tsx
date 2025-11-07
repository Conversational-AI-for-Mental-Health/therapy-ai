import { JournalEntry, JournalProps } from '@/util/types';
import React, { FC, useState } from 'react';
import JournalView from './RecentJournal';
import { callBackendAPI } from '@/util/api';

export default function Journal({
    moodOptions
}: JournalProps) {

    // Journal State
    const [selectedMood, setSelectedMood] = useState<{ mood: string; moodIcon: string } | null>(null);
    const [journalText, setJournalText] = useState('');
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
        {
            id: 2,
            date: 'Nov 1, 2025',
            mood: 'Hopeful',
            moodIcon: '🌟',
            text: 'Today was a good day overall. I woke up feeling refreshed and ready to tackle my tasks. The morning started with a peaceful walk in the park, which helped clear my mind and set a positive tone for the rest of the day. I noticed the changing leaves and took a moment to appreciate the beauty around me. Work was productive, and I managed to complete several important tasks that had been pending. I felt accomplished and proud of myself. In the evening, I spent quality time with family, which always lifts my spirits. We shared stories and laughed together, reminding me of the importance of connection. I am grateful for these moments and looking forward to more days like this. Overall, I feel hopeful about the future and excited about the possibilities ahead.',
        },
        {
            id: 1,
            date: 'Oct 30, 2025',
            mood: 'Nervous',
            moodIcon: '😰',
            text: 'Feeling a bit overwhelmed today with everything on my plate. There is so much to do and I am not sure where to start. The anxiety has been building up throughout the week, and today it reached a peak. I tried to make a to-do list to organize my thoughts, but even that felt daunting. My mind keeps racing with all the deadlines and responsibilities. I know I need to take things one step at a time, but it is hard to focus when everything feels urgent. I took a short break to breathe and remind myself that it is okay to feel this way. Anxiety does not define me, and I can work through it. I plan to tackle one small task at a time and be gentle with myself. Hopefully, tomorrow will feel a bit lighter.',
        },
        {
            id: 0,
            date: 'Oct 28, 2025',
            mood: 'Calm',
            moodIcon: '😌',
            text: 'Felt pretty relaxed today. Worked on a new feature and it went smoothly.',
        },
    ]);
    // Insights State
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [insightsContent, setInsightsContent] = useState('');
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const handleMoodSelect = (mood: string, moodIcon: string) => {
        setSelectedMood({ mood, moodIcon });
    };

    const handleSaveEntry = () => {
        if (!selectedMood || !journalText.trim()) {
            alert('Please select a mood and write an entry.');
            return;
        }
        const newId = journalEntries.length > 0 ? Math.max(...journalEntries.map((e) => e.id)) + 1 : 0;
        const newEntry: JournalEntry = {
            id: newId,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            mood: selectedMood.mood,
            moodIcon: selectedMood.moodIcon,
            text: journalText,
        };
        setJournalEntries([newEntry, ...journalEntries]);
        setJournalText('');
        setSelectedMood(null);
    };
    const handleUpdateEntry = (id: number, newText: string) => {
        setJournalEntries(journalEntries.map(entry =>
            entry.id === id ? { ...entry, text: newText } : entry
        ));
    };

    const handleDeleteEntry = (id: number) => {
        setJournalEntries(journalEntries.filter(entry => entry.id !== id));
    };

    const handleGetInsights = async (entryId: number) => {
        const entry = journalEntries.find((e) => e.id === entryId);
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
        <div className="overflow-y-auto">
            {/* New Entry */}
            <div className="bg-surface rounded-2xl shadow-lg" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                <h2 className="text-h2">How are you feeling today?</h2>
                <p className="text-body-lg text-secondary" style={{ marginTop: 'var(--space-xxs)', marginBottom: 'var(--space-md)' }}>
                    Select a mood and write down your thoughts.
                </p>

                {/* Mood Selector */}
                <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    {moodOptions.map((option) => (
                        <div
                            key={option.mood}
                            data-mood={option.mood}
                            onClick={() => handleMoodSelect(option.mood, option.moodIcon)}
                            className={`mood-icon cursor-pointer bg-white/10 dark:bg-black/10 rounded-full transition-transform duration-200 ${selectedMood?.mood === option.mood ? 'selected' : ''
                                }`}
                            style={{ fontSize: 'var(--space-lg)', padding: 'var(--space-xs)' }}
                        >
                            {option.moodIcon}
                        </div>
                    ))}
                </div>

                {/* Journal Text Area */}
                <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                    placeholder="Start today's entry..."
                    style={{ height: '160px', padding: 'var(--space-sm)' }}
                />

                {/* Save Button */}
                <div className="flex justify-end" style={{ marginTop: 'var(--space-sm)' }}>
                    <button
                        onClick={handleSaveEntry}
                        className="bg-primary text-white text-body rounded-lg hover:opacity-90 transition"
                        style={{ height: '44px', padding: '0 var(--space-md)' }}
                    >
                        Save Entry
                    </button>
                </div>
            </div>

            {/* Recent Entries */}
            <JournalView
                journalEntries={journalEntries}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
                onGetInsights={handleGetInsights}
            />
        </div>
    );
};