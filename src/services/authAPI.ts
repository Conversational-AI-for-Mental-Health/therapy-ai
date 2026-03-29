import * as SecureStore from 'expo-secure-store';
import { AuthData, AuthResponse } from '../types';
import { API_URL } from '../constants/constants';

class AuthAPI {
  private async persistAuthData(data?: AuthData) {
    if (!data) return;
    const token = data.token || data.accessToken;
    if (token) await SecureStore.setItemAsync('token', token);
    if (data.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    if (data.user) await SecureStore.setItemAsync('user', JSON.stringify(data.user));
  }

  async storeAuthData(data?: AuthData) {
    await this.persistAuthData(data);
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (data?.success) await this.persistAuthData(data.data);
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data?.success) await this.persistAuthData(data.data);
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Forgot password failed' };
    }
  }

  async resetPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Reset password failed' };
    }
  }

  async socialLogin(provider: 'google' | 'apple', profile: any, idToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, profile, idToken }),
      });
      const data = await response.json();
      if (data?.success) await this.persistAuthData(data.data);
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Social login failed' };
    }
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const user = await this.getCurrentUser();
      if (!refreshToken || !user?._id) return { success: false, error: 'Missing refresh session' };

      const response = await fetch(`${API_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, refreshToken }),
      });
      const data = await response.json();
      if (data?.success) await this.persistAuthData({ ...data.data, user });
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to refresh token' };
    }
  }

  async logout() {
    try {
      const token = await this.getToken();
      const refreshToken = await this.getRefreshToken();
      if (token) {
        await fetch(`${API_URL}/users/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch { /* swallow */ }
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
  }

  async getCurrentUser() {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getToken() {
    return SecureStore.getItemAsync('token');
  }

  async getRefreshToken() {
    return SecureStore.getItemAsync('refreshToken');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthAPI();
