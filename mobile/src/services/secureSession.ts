// tokens in Keychain / Keystore — not AsyncStorage (OWASP MASVS storage)
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthUser } from '@therapy-ai/shared';

const K = {
  access: 'therapy_ai_at',
  refresh: 'therapy_ai_rt',
  user: 'therapy_ai_u',
};

const canUseSecure = Platform.OS === 'ios' || Platform.OS === 'android';

async function set(k: string, v: string) {
  if (!canUseSecure) return;
  await SecureStore.setItemAsync(k, v, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

async function get(k: string) {
  if (!canUseSecure) return null;
  return SecureStore.getItemAsync(k);
}

async function del(k: string) {
  if (!canUseSecure) return;
  await SecureStore.deleteItemAsync(k);
}

export async function saveTokens(access: string, refresh?: string, user?: AuthUser) {
  await set(K.access, access);
  if (refresh) await set(K.refresh, refresh);
  if (user) await set(K.user, JSON.stringify(user));
}

export async function clearSession() {
  await del(K.access);
  await del(K.refresh);
  await del(K.user);
}

export async function getAccessToken() {
  return get(K.access);
}

export async function getRefreshToken() {
  return get(K.refresh);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const j = await get(K.user);
  if (!j) return null;
  try {
    return JSON.parse(j) as AuthUser;
  } catch {
    return null;
  }
}
