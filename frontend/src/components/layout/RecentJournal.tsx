import { useState } from 'react';
import { Edit2, Eye, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalViewProps, JournalEntry } from '@/util/types';
import React from 'react';


export default function JournalView({
  journalEntries,
  onUpdateEntry,
  onDeleteEntry,
  onGetInsights,
}: JournalViewProps) {
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditText(entry.text);
    setExpandedEntryId(entry.id);
  };

  const handleEditSave = (id: number) => {
    if (editText.trim()) {
      onUpdateEntry(id, editText);
      setEditingEntryId(null);
      setEditText('');
    }
  };

  const handleEditCancel = () => {
    setEditingEntryId(null);
    setEditText('');
  };

  const handleViewToggle = (id: number) => {
    if (expandedEntryId === id) {
      setExpandedEntryId(null);
      setEditingEntryId(null);
    } else {
      setExpandedEntryId(id);
      setEditingEntryId(null);
    }
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleGetInsights = (entry: JournalEntry) => {
    const wordCount = countWords(entry.text);
    if (wordCount < 100) {
      alert(`Your entry needs at least 100 words for AI analysis. Current word count: ${wordCount}`);
      return;
    }
    onGetInsights(entry.id);
  };

  if (journalEntries.length === 0) {
    return (
      <div className="bg-surface rounded-2xl shadow-lg flex flex-col items-center justify-center" style={{ padding: 'var(--space-xl)', minHeight: '300px' }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>📖</div>
        <h3 className="text-h3 text-secondary" style={{ marginBottom: 'var(--space-xs)' }}>
          No entries yet
        </h3>
        <p className="text-body text-secondary text-center">
          Start journaling to track your thoughts and feelings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-10">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
        <h3 className="text-h2">Recent Entries</h3>
        <p className="text-body-sm text-secondary">
          {journalEntries.length} {journalEntries.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <AnimatePresence>
          {journalEntries.map((entry) => {
            const isExpanded = expandedEntryId === entry.id;
            const isEditing = editingEntryId === entry.id;
            const wordCount = countWords(entry.text);
            const canGetInsights = wordCount >= 100;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-surface rounded-xl shadow-sm border border-color overflow-hidden"
              >
                {/* Entry Header - Always Visible */}
                <div 
                  className="flex items-start sm:items-center justify-between flex-col sm:flex-row cursor-pointer hover:bg-primary/5 transition"
                  style={{ padding: 'var(--space-sm)', gap: 'var(--space-sm)' }}
                  onClick={() => !isEditing && handleViewToggle(entry.id)}
                >
                  <div className="flex items-center flex-1 lg:w-1/2 overflow-hidden">
                    <div style={{ fontSize: 'var(--space-lg)', marginRight: 'var(--space-sm)' }}>
                      {entry.moodIcon}
                    </div>
                    <div className="flex-1">
                      <p className="text-body" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        {entry.date} - Feeling {entry.mood}
                      </p>
                      {!isExpanded && (
                        <p className="text-body-sm text-secondary truncate max-w-md">
                          {entry.text}
                        </p>
                      )}
                      <p className="text-caption text-secondary" style={{ marginTop: 'var(--space-xxs)' }}>
                        {wordCount} words {canGetInsights ? '✓' : `(${100 - wordCount} more needed for insights)`}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center w-full sm:w-auto" style={{ gap: 'var(--space-xs)' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleViewToggle(entry.id)}
                      className="flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition"
                      style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
                      title={isExpanded ? "Collapse" : "View full entry"}
                    >
                      <Eye size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleEditStart(entry)}
                      className="flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition"
                      style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
                      title="Edit entry"
                    >
                      <Edit2 size={18} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="flex items-center justify-center text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
                      title="Delete entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-color" style={{ padding: 'var(--space-md)' }}>
                        {isEditing ? (
                          // Edit Mode
                          <div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                              style={{ minHeight: '200px', padding: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}
                              autoFocus
                            />
                            <div className="flex items-center justify-between">
                              <p className="text-body-sm text-secondary">
                                {countWords(editText)} words
                              </p>
                              <div className="flex" style={{ gap: 'var(--space-xs)' }}>
                                <button
                                  onClick={handleEditCancel}
                                  className="text-body-sm text-secondary hover:text-primary border border-color rounded-lg transition"
                                  style={{ padding: 'var(--space-xxs) var(--space-sm)' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditSave(entry.id)}
                                  className="text-body-sm bg-primary text-white rounded-lg hover:opacity-90 transition"
                                  style={{ padding: 'var(--space-xxs) var(--space-sm)' }}
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <p className="text-body text-secondary whitespace-pre-wrap" style={{ lineHeight: '1.7' }}>
                              {entry.text}
                            </p>
                            
          
                            <div className="flex justify-center" style={{ marginTop: 'var(--space-md)' }}>
                              <button
                                onClick={() => handleGetInsights(entry)}
                                disabled={!canGetInsights}
                                className={`text-body flex items-center rounded-lg transition ${
                                  canGetInsights
                                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                }`}
                                style={{ padding: 'var(--space-xs) var(--space-md)', gap: 'var(--space-xs)' }}
                                title={canGetInsights ? 'Get AI insights' : 'Need at least 100 words for insights'}
                              >
                                <Sparkles size={18} />
                                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                  Get Insights
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
