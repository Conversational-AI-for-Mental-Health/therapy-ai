import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { JournalEntry, MoodOption } from '../types';
import journalApi from '../services/journalApi';
import { colors, spacing, radius } from '../constants/theme';
import { moodOptions } from '../constants/constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function JournalPanel() {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [journalText, setJournalText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await journalApi.getEntries();
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
      const newEntry = await journalApi.createEntry(journalText, selectedMood.mood, selectedMood.moodIcon);
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
            await journalApi.deleteEntry(id);
            setEntries(prev => prev.filter(e => e._id !== id));
            if (expandedId === id) setExpandedId(null);
          } catch (err: any) {
            setError(err.message || 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const handleEntryPress = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
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

      <TextInput
        style={styles.textarea}
        testID="journal-input"
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
          {entries.map((entry) => {
            const isExpanded = expandedId === entry._id;
            return (
              <TouchableOpacity
                key={entry._id}
                style={[styles.entryCard, isExpanded && styles.entryCardExpanded]}
                onPress={() => handleEntryPress(entry._id)}
                onLongPress={() => handleDelete(entry._id)}
                activeOpacity={0.8}
              >
                {/* Header row — always visible */}
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{entry.moodIcon}</Text>
                  <View style={styles.entryMeta}>
                    <Text style={styles.entryDate}>{formatDate(entry.createdAt)} · Feeling {entry.mood}</Text>
                    {!isExpanded && (
                      <Text style={styles.entryPreview} numberOfLines={2}>{entry.text}</Text>
                    )}
                  </View>
                  {/* Chevron indicator */}
                  <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                </View>

                {/* Full text — only shown when expanded */}
                {isExpanded && (
                  <Text style={styles.entryFullText}>{entry.text}</Text>
                )}
              </TouchableOpacity>
            );
          })}
          <Text style={styles.deleteHint}>Tap to expand · Long press to delete</Text>
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
  moodBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  moodBtnSelected: { borderColor: colors.accent },
  moodEmoji: { fontSize: 26 },
  moodLabel: { color: colors.accent, fontSize: 13, marginBottom: spacing.sm },
  textarea: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 14, lineHeight: 22, minHeight: 140, marginBottom: spacing.sm },
  error: { color: '#e07070', fontSize: 13, marginBottom: spacing.sm },
  saveBtn: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 20, marginBottom: spacing.lg },
  saveBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  recentLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.sm },
  entryCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  entryCardExpanded: { borderColor: colors.accent },
  entryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  entryMood: { fontSize: 22 },
  entryMeta: { flex: 1 },
  entryDate: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  entryPreview: { color: colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 18 },
  entryFullText: { color: colors.text, fontSize: 14, lineHeight: 22, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  chevron: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  deleteHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: spacing.sm },
  loadingText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.md },
});