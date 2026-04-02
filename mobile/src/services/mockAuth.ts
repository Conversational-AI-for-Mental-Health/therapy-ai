import * as SecureStore from 'expo-secure-store';

export const mockLogin = async (email: string, _password: string) => {
  await new Promise(res => setTimeout(res, 800)); 

  if (email) {
    await SecureStore.setItemAsync('therapy_ai_at', 'mock-access-token');
    await SecureStore.setItemAsync('therapy_ai_rt', 'mock-refresh-token');
    await SecureStore.setItemAsync(
      'therapy_ai_u',
      JSON.stringify({ _id: 'mock-user-id', name: 'Demo User', email }),
    );
    return { success: true };
  }

  return { success: false, error: 'Email required' };
};

export const mockLogout = async () => {
  await SecureStore.deleteItemAsync('therapy_ai_at');
  await SecureStore.deleteItemAsync('therapy_ai_rt');
  await SecureStore.deleteItemAsync('therapy_ai_u');
};