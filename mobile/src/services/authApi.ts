import {
  type AuthResponse,
  type ForgotPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
} from '@therapy-ai/shared';
import { API_BASE_URL } from '../config/env';

async function request<TBody>(
  path: string,
  body: TBody,
  token?: string,
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as AuthResponse;
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const authApi = {
  register(payload: RegisterRequest) {
    return request('/users/register', payload);
  },
  login(payload: LoginRequest) {
    return request('/users/login', payload);
  },
  forgotPassword(payload: ForgotPasswordRequest) {
    return request('/users/forgot-password', payload);
  },
  resetPassword(payload: ResetPasswordRequest) {
    return request('/users/reset-password', payload);
  },
  socialLogin(payload: {
    provider: 'google' | 'apple';
    profile: { id: string; email: string; name?: string };
    idToken: string;
  }) {
    return request('/users/social-login', payload);
  },
  refreshAccessToken(payload: { userId: string; refreshToken: string }) {
    return request('/users/refresh-token', payload);
  },
  logout(payload: { refreshToken?: string }, accessToken: string) {
    return request('/users/logout', payload, accessToken);
  },
};
