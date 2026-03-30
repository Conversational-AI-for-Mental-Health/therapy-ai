import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { JournalEntry, MoodOption } from '../types';
import journalAPI from '../services/journalAPI';
import { colors, spacing, radius } from '../constants/theme';
import { moodOptions } from '../constants/constants';

export default function JournalPanel() {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [journalText, setJournalText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await journalAPI.getEntries();
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) { setError('Please select a mood'); return; }
    if (!journalText.trim()) { setError('Please write something'); return; }
    setError('');
    try {
      const newEntry = await journalAPI.createEntry(journalText, selectedMood.mood, selectedMood.moodIcon);
      setEntries([newEntry, ...entries]);
      setJournalText('');
      setSelectedMood(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await journalAPI.deleteEntry(id);
            setEntries(entries.filter(e => e._id !== id));
          } catch (err: any) {
            setError(err.message || 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.prompt}>How are you feeling today?</Text>

      {/* Mood Selector */}
      <View style={styles.moodRow}>
        {moodOptions.map((option) => (
          <TouchableOpacity
            key={option.mood}
            style={[styles.moodBtn, selectedMood?.mood === option.mood && styles.moodBtnSelected]}
            onPress={() => { setSelectedMood(option); setError(''); }}
          >
            <Text style={styles.moodEmoji}>{option.moodIcon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMood && (
        <Text style={styles.moodLabel}>Feeling {selectedMood.mood}</Text>
      )}

      {/* Journal Input */}
      <TextInput
        style={styles.textarea}
        placeholder="Start today's entry..."
        placeholderTextColor={colors.textMuted}
        value={journalText}
        onChangeText={setJournalText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Entry</Text>
      </TouchableOpacity>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <>
          <Text style={styles.recentLabel}>Recent Entries</Text>
          {entries.map((entry) => (
            <TouchableOpacity
              key={entry._id}
              style={styles.entryCard}
              onLongPress={() => handleDelete(entry._id)}
              activeOpacity={0.8}
            >
              <Text style={styles.entryMood}>{entry.moodIcon}</Text>
              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{formatDate(entry.createdAt)} · Feeling {entry.mood}</Text>
                <Text style={styles.entryPreview} numberOfLines={2}>{entry.text}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={styles.deleteHint}>Long press an entry to delete</Text>
        </>
      )}

      {loading && <Text style={styles.loadingText}>Loading entries...</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  prompt: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.md },
  moodRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  moodBtn: {
    width: 52, height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnSelected: { borderColor: colors.accent },
  moodEmoji: { fontSize: 26 },
  moodLabel: { color: colors.accent, fontSize: 13, marginBottom: spacing.sm },
  textarea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 140,
    marginBottom: spacing.sm,
  },
  error: { color: '#e07070', fontSize: 13, marginBottom: spacing.sm },
  saveBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: spacing.lg,
  },
  saveBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  recentLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.sm,
  },
  entryMood: { fontSize: 22 },
  entryMeta: { flex: 1 },
  entryDate: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  entryPreview: { color: colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 18 },
  deleteHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: spacing.sm },
  loadingText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.md },
});
