import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, typography } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigation.replace('Dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Your safe space to reflect and grow</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnPrimaryText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.btnSocial} onPress={() => {}}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSocial} onPress={() => {}}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>No account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  logo: { fontSize: 52, marginBottom: 12 },
  title: { ...typography.h1, color: colors.accent, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 36, textAlign: 'center' },
  form: { width: '100%', maxWidth: 360, gap: 12 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 15, color: colors.text, fontSize: 15, marginBottom: 4 },
  error: { color: '#e07070', fontSize: 13, textAlign: 'center' },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.sm, padding: 15, alignItems: 'center' },
  btnPrimaryText: { color: 'white', fontSize: 15, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  btnSocial: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 13 },
  socialIcon: { fontSize: 16, fontWeight: '700', color: colors.text },
  socialText: { color: colors.text, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { color: colors.textMuted, fontSize: 13 },
  footerLink: { color: colors.accent, fontSize: 13 },
});
