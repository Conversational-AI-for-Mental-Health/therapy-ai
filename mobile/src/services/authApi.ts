import {
  type AuthResponse,
  type ForgotPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
} from '@therapy-ai/shared';
import { apiFetch, readJson } from './apiClient';
import {
  saveSession,
  clearSession,
  getAccessToken,
  getRefreshToken,
  getExpiresAt,
  getStoredUser,
  type StoredUser,
} from './secureSession';


async function post<TBody>(
  path: string,
  body: TBody,
  accessToken?: string,
): Promise<AuthResponse> {
  try {
    const res  = await apiFetch(path, { method: 'POST', body: JSON.stringify(body), accessToken });
    const data = await readJson<AuthResponse>(res);
    return data ?? { success: false, error: 'Empty response' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}


export const authApi = {
  register(payload: RegisterRequest) {
    return post('/users/register', payload);
  },

  login(payload: LoginRequest) {
    return post('/users/login', payload);
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return post('/users/forgot-password', payload);
  },

  resetPassword(payload: ResetPasswordRequest) {
    return post('/users/reset-password', payload);
  },

  socialLogin(payload: {
    provider: 'google' | 'apple';
    profile:  { id: string; email: string; name?: string };
    idToken:  string;
  }) {
    return post('/users/social-login', payload);
  },

  refreshAccessToken(payload: { userId: string; refreshToken: string }) {
    return post('/users/refresh-token', payload);
  },

  logout(payload: { refreshToken?: string }, accessToken: string) {
    return post('/users/logout', payload, accessToken);
  },
};


export async function persistAuthData(data: {
  user: StoredUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: string;
}) {
  await saveSession(data);
}


export async function getValidToken(): Promise<string | null> {
  try {
    const expiresAt    = await getExpiresAt();
    const needsRefresh = expiresAt - Date.now() < 60_000;

    if (!needsRefresh) {
      return getAccessToken();
    }

    const [refreshToken, user] = await Promise.all([
      getRefreshToken(),
      getStoredUser(),
    ]);

    if (!refreshToken || !user?._id) {
      await clearSession();
      return null;
    }

    const result = await authApi.refreshAccessToken({ userId: user._id, refreshToken });
    if (!result.success || !result.data) {
      await clearSession();
      return null;
    }

    const { accessToken, refreshToken: newRefresh, accessTokenExpiresIn } = result.data;
    if (!accessToken || !newRefresh) {
      await clearSession();
      return null;
    }

    await saveSession({ accessToken, refreshToken: newRefresh, user, accessTokenExpiresIn });
    return accessToken;
  } catch {
    return null;
  }
}

export { clearSession, getStoredUser };
