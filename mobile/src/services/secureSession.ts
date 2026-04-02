import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const K = {
  access: 'therapy_ai_at',
  refresh: 'therapy_ai_rt',
  user: 'therapy_ai_u',
  expires: 'therapy_ai_exp',
} as const;

const canUseSecure = Platform.OS === 'ios' || Platform.OS === 'android';

async function set(k: string, v: string) {
  if (!canUseSecure) return;
  await SecureStore.setItemAsync(k, v, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
}

async function get(k: string): Promise<string | null> {
  if (!canUseSecure) return null;
  return SecureStore.getItemAsync(k);
}

async function del(k: string) {
  if (!canUseSecure) return;
  await SecureStore.deleteItemAsync(k);
}

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
}

export async function saveSession(params: {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
  accessTokenExpiresIn?: string;
}) {
  await set(K.access,  params.accessToken);
  await set(K.refresh, params.refreshToken);
  await set(K.user,    JSON.stringify(params.user));
  if (params.accessTokenExpiresIn) {
    const minutes   = parseInt(params.accessTokenExpiresIn) || 60;
    const expiresAt = Date.now() + minutes * 60 * 1000;
    await set(K.expires, String(expiresAt));
  }
}

export async function clearSession() {
  await del(K.access);
  await del(K.refresh);
  await del(K.user);
  await del(K.expires);
}

export async function getAccessToken(): Promise<string | null> {
  return get(K.access);
}

export async function getRefreshToken(): Promise<string | null> {
  return get(K.refresh);
}

export async function getExpiresAt(): Promise<number> {
  const val = await get(K.expires);
  return val ? parseInt(val) : 0;
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const j = await get(K.user);
  if (!j) return null;
  try { return JSON.parse(j) as StoredUser; }
  catch { return null; }
}
