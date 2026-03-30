import * as SecureStore from 'expo-secure-store';

export const mockLogin = async (email: string, password: string) => {
  await new Promise(res => setTimeout(res, 1000)); // fake delay

  if (email && password) {
    await SecureStore.setItemAsync("token", "demo-token");
    return { success: true };
  }

  return { success: false };
};

export const logout = async () => {
  await SecureStore.deleteItemAsync("token");
};

export const isLoggedIn = async () => {
  const token = await SecureStore.getItemAsync("token");
  return !!token;
};