import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Switch, Alert, ScrollView, Pressable,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  user?: { name: string; email: string };
}

export default function SettingsModal({ visible, onClose, onLogout, user }: SettingsModalProps) {
  const [analyticsTracking, setAnalyticsTracking] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleDeleteChats = () => {
    Alert.alert('Delete All Chats', 'This will permanently delete all your conversations. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is permanent and cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Account', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Log Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable testID="settings-backdrop" style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <TouchableOpacity testID="close-settings-modal" onPress={onClose} hitSlop={{top: 20, bottom: 20, left: 50, right: 50}}>
          <View style={styles.drag} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>

          {/* Privacy Controls */}
          <Text style={styles.sectionLabel}>Privacy Controls</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Analytics Tracking</Text>
              <Switch value={analyticsTracking} onValueChange={setAnalyticsTracking} trackColor={{ false: colors.surface2, true: colors.primary }} thumbColor="white" />
            </View>
            <View style={[styles.toggleRow, styles.toggleRowBorder]}>
              <Text style={styles.toggleLabel}>Personalized Ads</Text>
              <Switch value={personalizedAds} onValueChange={setPersonalizedAds} trackColor={{ false: colors.surface2, true: colors.primary }} thumbColor="white" />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: colors.surface2, true: colors.primary }} thumbColor="white" />
            </View>
          </View>

          {/* Data Management */}
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Data Management</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteChats}>
            <Text style={styles.dangerBtnText}>Delete All Chats</Text>
            <Text style={styles.dangerIcon}>🗑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, { marginTop: 8 }]} onPress={handleDeleteAccount}>
            <Text style={styles.dangerBtnText}>Delete Account</Text>
            <Text style={styles.dangerIcon}>⚠️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '88%', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  drag: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  profileSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 64, height: 64, backgroundColor: colors.primary, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: 'white', fontSize: 28, fontWeight: '600' },
  profileName: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  profileEmail: { color: colors.textMuted, fontSize: 13 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600', marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface2, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  toggleRowBorder: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  toggleLabel: { color: colors.text, fontSize: 14 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(192,84,74,0.1)', borderWidth: 1, borderColor: 'rgba(192,84,74,0.3)', borderRadius: radius.sm, paddingVertical: 12, paddingHorizontal: spacing.md },
  dangerBtnText: { color: colors.danger, fontSize: 14 },
  dangerIcon: { fontSize: 16 },
  logoutBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, padding: 14, alignItems: 'center', marginTop: spacing.lg },
  logoutBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
