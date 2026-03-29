import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Pressable, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatSession } from '../types';
import { colors, spacing, radius, typography } from '../constants/theme';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onContactProfessional: () => void;
  onNavigate: (screen: string) => void;
  user?: { name: string; email: string };
}

export default function Sidebar({
  isOpen, onClose, onNewConversation, chatSessions, currentChatId,
  onSelectChat, onDeleteChat, onContactProfessional, onNavigate, user,
}: SidebarProps) {
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={styles.drawer}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{firstName}</Text>
                  <Text style={styles.userTagline}>Your safe space</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* New Conversation */}
            <TouchableOpacity style={styles.newChatBtn} onPress={() => { onNewConversation(); onClose(); }}>
              <Text style={styles.newChatText}>✏️  New Conversation</Text>
            </TouchableOpacity>

            {/* Chat History */}
            <Text style={styles.sectionLabel}>Previous Chats</Text>
            <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
              {chatSessions.length === 0 ? (
                <Text style={styles.emptyText}>No previous chats yet</Text>
              ) : (
                chatSessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={[styles.chatItem, session.id === currentChatId && styles.chatItemActive]}
                    onPress={() => { onSelectChat(session.id); onClose(); }}
                  >
                    <Text style={styles.chatItemTitle} numberOfLines={1}>{session.title}</Text>
                    <Text style={styles.chatItemPreview} numberOfLines={1}>{session.preview}</Text>
                    <Text style={styles.chatItemTime}>{session.timestamp}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.contactBtn} onPress={onContactProfessional}>
                <Text style={styles.contactBtnText}>🧑‍⚕️  Contact Professional</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtn} onPress={() => {}}>
                <Text style={styles.footerBtnText}>📖  Our Story</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtn} onPress={() => {}}>
                <Text style={styles.footerBtnText}>🔒  Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtn} onPress={() => {}}>
                <Text style={styles.footerBtnText}>✉️  Contact Us</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    width: 280,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: '600', fontSize: 16 },
  userName: { color: colors.text, fontWeight: '600', fontSize: 14 },
  userTagline: { color: colors.textMuted, fontSize: 11 },
  closeBtn: { padding: 6 },
  closeBtnText: { color: colors.textMuted, fontSize: 18 },
  newChatBtn: {
    margin: spacing.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
  },
  newChatText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  sectionLabel: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  chatList: { flex: 1, paddingHorizontal: spacing.sm },
  chatItem: {
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  chatItemActive: { backgroundColor: colors.surface2 },
  chatItemTitle: { color: colors.text, fontSize: 13, fontWeight: '500' },
  chatItemPreview: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  chatItemTime: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  emptyText: { color: colors.textMuted, fontSize: 12, padding: 10 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.sm,
    gap: 4,
  },
  contactBtn: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  contactBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  footerBtn: {
    padding: 10,
    borderRadius: radius.sm,
  },
  footerBtnText: { color: colors.text, fontSize: 13 },
});
