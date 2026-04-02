import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ActivityIndicator, Pressable, Platform,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { getValidToken } from '../services/authApi';


async function requestProfessionalSupport(params: {
  userPhone?: string;
  reason?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getValidToken();
    const { getApiBaseUrl } = await import('../config/env');
    const res = await fetch(`${getApiBaseUrl()}/emergency/request-support`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return {
      success: data.success ?? false,
      message: data.message || (data.success ? 'Request sent.' : 'Request failed.'),
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error. Please try again.' };
  }
}

interface ProfessionalSupportModalProps {
  visible:  boolean;
  onClose:  () => void;
}

export default function ProfessionalSupportModal({ visible, onClose }: ProfessionalSupportModalProps) {
  const [userPhone, setUserPhone] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusIsError, setStatusIsError] = useState(false);

  const reset = () => {
    setUserPhone('');
    setStatusMessage('');
    setStatusIsError(false);
    setIsRequesting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async (skipPhone = false) => {
    if (isRequesting) return;
    setIsRequesting(true);
    setStatusMessage('');
    setStatusIsError(false);

    const result = await requestProfessionalSupport({
      userPhone: skipPhone ? undefined : (userPhone.trim() || undefined),
      reason: 'User requested professional mental health support from mobile app',
    });

    if (result.success) {
      setStatusMessage(result.message || 'Professional support has been notified. Someone will contact you soon.');
      setStatusIsError(false);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } else {
      setStatusMessage(
        result.message ||
        'An error occurred. Please try calling 988 (Suicide & Crisis Lifeline) or 911 if this is an emergency.',
      );
      setStatusIsError(true);
    }

    setIsRequesting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Modal card — centred on screen */}
      <View style={styles.centeredWrapper} pointerEvents="box-none">
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Contact Professional Support</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body text */}
          <Text style={styles.body}>
            A mental health professional will be notified and will contact you soon.
          </Text>

          {/* Emergency notice — always visible */}
          <View style={styles.emergencyBox}>
            <Text style={styles.emergencyLabel}>🚨 If this is an emergency:</Text>
            <Text style={styles.emergencyText}>
              Call <Text style={styles.bold}>988</Text> (Suicide &amp; Crisis Lifeline) or{' '}
              <Text style={styles.bold}>911</Text> immediately.
            </Text>
          </View>

          {/* Phone input */}
          <Text style={styles.inputLabel}>Your Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={userPhone}
            onChangeText={setUserPhone}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            editable={!isRequesting}
          />
          <Text style={styles.inputHint}>
            Providing your number helps professionals reach you faster
          </Text>

          {/* Status message */}
          {statusMessage ? (
            <View style={[styles.statusBox, statusIsError ? styles.statusError : styles.statusSuccess]}>
              <Text style={[styles.statusText, statusIsError ? styles.statusTextError : styles.statusTextSuccess]}>
                {statusMessage}
              </Text>
            </View>
          ) : null}

          {/* Action buttons — mirrors web Skip / Send Request layout */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btnSecondary, isRequesting && styles.btnDisabled]}
              onPress={() => handleSend(true)}
              disabled={isRequesting}
            >
              <Text style={styles.btnSecondaryText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, isRequesting && styles.btnDisabled]}
              onPress={() => handleSend(false)}
              disabled={isRequesting}
            >
              {isRequesting
                ? <ActivityIndicator color="white" size="small" />
                : <Text style={styles.btnPrimaryText}>Send Request</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  centeredWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  card: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 17, fontWeight: '700', color: colors.accent, flex: 1, marginRight: spacing.sm },
  closeBtn: { padding: 4 },
  closeBtnText: { color: colors.textMuted, fontSize: 18 },
  body: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 21 },
  emergencyBox: { backgroundColor: colors.surface2, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md },
  emergencyLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emergencyText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  bold: { fontWeight: '700', color: colors.text },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, color: colors.text, fontSize: 15, marginBottom: 6 },
  inputHint: { fontSize: 11, color: colors.textMuted, marginBottom: spacing.md },
  statusBox: { borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  statusSuccess: { backgroundColor: 'rgba(74,180,120,0.12)' },
  statusError: { backgroundColor: 'rgba(192,84,74,0.12)' },
  statusText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  statusTextSuccess:{ color: '#4ab478' },
  statusTextError: { color: colors.danger },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  btnPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText:  { color: 'white', fontSize: 15, fontWeight: '600' },
  btnSecondary: { flex: 1, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText:{ color: colors.textMuted, fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
});