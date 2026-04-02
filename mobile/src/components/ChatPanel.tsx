import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { ChatMessage } from '../types';
import { colors, spacing, radius } from '../constants/theme';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  chatInput: string;
  onChatInputChange: (text: string) => void;
  onSendMessage: () => void;
  onQuickPrompt: (prompt: string) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  quickPrompts: string[];
  onLoadOlderMessages?: () => void;
  chatHasMore?: boolean;
}

const TypingDots = () => (
  <View style={styles.typingContainer}>
    {[0, 1, 2].map((i) => (
      <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />
    ))}
  </View>
);

export default function ChatPanel({
  chatHistory, chatInput, onChatInputChange, onSendMessage,
  onQuickPrompt, isGenerating, onStopGeneration, quickPrompts, onLoadOlderMessages, chatHasMore,
}: ChatPanelProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const prevHeightRef = useRef(0);
  const layoutHeightRef  = useRef(0);

  const isPrependingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const isUserSendingMessageRef = useRef(false);

  const handleScroll = ({ nativeEvent }: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    layoutHeightRef.current  = layoutMeasurement.height;
    isAtBottomRef.current = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;

    const nearTop = contentOffset.y <= 50;

    if (nearTop && onLoadOlderMessages && !isLoadingRef.current && !isGenerating) {
      isLoadingRef.current = true;
      setLoadingOlder(true);
      isPrependingRef.current = true;
      Promise.resolve(onLoadOlderMessages()).finally(() => {
        isLoadingRef.current = false;
        setLoadingOlder(false);
        setTimeout(() => { isPrependingRef.current = false; }, 500);
      });
    }
  };

  const handleSendMessageInternal = () => {
    isUserSendingMessageRef.current = true;
    onSendMessage();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Quick Prompts */}
      <View style={styles.promptsSection}>
        <Text style={styles.promptsLabel}>Quick Prompts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.promptChip}
              onPress={() => onQuickPrompt(prompt)}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading older messages indicator */}
      {loadingOlder && (
        <View style={styles.loadingOlderRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.loadingOlderText}>Loading earlier messages…</Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(_, height) => {
          const delta = height - prevHeightRef.current;
          prevHeightRef.current = height;
          
          if (isPrependingRef.current && delta > 0) {
            scrollRef.current?.scrollTo({ y: delta, animated: false });
          } else if (!isPrependingRef.current && (isUserSendingMessageRef.current || isAtBottomRef.current)) {
            scrollRef.current?.scrollToEnd({ animated: true });  
            isUserSendingMessageRef.current = false;
          }
        }}
      >
        {chatHasMore && onLoadOlderMessages && !loadingOlder && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity onPress={() => {
              if (isLoadingRef.current) return;
              isLoadingRef.current = true;
              setLoadingOlder(true);
              isPrependingRef.current = true;
              Promise.resolve(onLoadOlderMessages()).finally(() => {
                isLoadingRef.current = false;
                setLoadingOlder(false);
                setTimeout(() => { isPrependingRef.current = false; }, 500);
              });
            }} style={styles.loadMoreBtn}>
              <Text style={styles.loadMoreText}>Load earlier messages</Text>
            </TouchableOpacity>
          </View>
        )}
        {chatHistory.map((msg, index) => (
          <View key={index} style={[styles.msgRow, msg.sender === 'user' ? styles.msgRowUser : styles.msgRowAi]}>
            {msg.thinking ? (
              <View style={[styles.bubble, styles.bubbleAi]}>
                <TypingDots />
              </View>
            ) : (
              <View style={[styles.bubble, msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.bubbleText, msg.sender === 'user' && styles.bubbleTextUser]}>
                  {msg.text}
                </Text>
              </View>
            )}
          </View>
        ))}
        {isGenerating && (
          <View style={styles.generatingRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <TouchableOpacity onPress={onStopGeneration} style={styles.stopBtn}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={colors.textMuted}
          value={chatInput}
          onChangeText={onChatInputChange}
          multiline
          maxLength={10000}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSendMessageInternal}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessageInternal} disabled={!chatInput.trim()}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  promptsSection: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 4 },
  promptsLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  promptsScroll: { flexDirection: 'row' },
  promptChip: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6 },
  promptChipText: { color: colors.text, fontSize: 12 },
  loadingOlderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, backgroundColor: colors.surface2 },
  loadingOlderText: { color: colors.textMuted, fontSize: 12 },
  loadMoreContainer: { alignItems: 'center', marginVertical: 10 },
  loadMoreBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.surface2, borderRadius: 20 },
  loadMoreText: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  messages: { flex: 1 },
  messagesContent: { padding: spacing.md, gap: 10, flexGrow: 1 },
  msgRow: { flexDirection: 'row' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', borderRadius: 18, padding: 11 },
  bubbleUser: { backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: colors.aiBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: 'white' },
  typingContainer: { flexDirection: 'row', gap: 4, padding: 4, alignItems: 'center' },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  generatingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm },
  stopBtn: { backgroundColor: colors.surface2, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 10 },
  stopBtnText: { color: colors.text, fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.bg },
  input: { flex: 1, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 11, color: colors.text, fontSize: 14, maxHeight: 120 },
  sendBtn: { width: 42, height: 42, backgroundColor: colors.primary, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: 'white', fontSize: 16 },
});
