/// <reference types="jest" />
import { authApi, getValidToken, persistAuthData, clearSession, getStoredUser } from '../../../services/authApi';
import { apiFetch, readJson } from '../../../services/apiClient';
import * as secureSession from '../../../services/secureSession';

jest.mock('../../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../../services/secureSession', () => ({
  saveSession: jest.fn(),
  clearSession: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  getExpiresAt: jest.fn(),
  getStoredUser: jest.fn(),
}));

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth methods', () => {
    it('login calls correct endpoint and returns parsed json', async () => {
      const mockResponse = { success: true, data: { accessToken: '123' } };
      (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
      (readJson as jest.Mock).mockResolvedValue(mockResponse);

      const payload = { email: 't@t.com', password: 'password' };
      const result = await authApi.login(payload);

      expect(apiFetch).toHaveBeenCalledWith('/users/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        accessToken: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('returns generic error on network failure', async () => {
      (apiFetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await authApi.login({ email: 't@t.com', password: 'password' });

      expect(result).toEqual({ success: false, error: 'Network error' });
    });

    it('returns empty response error if data is empty', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
      (readJson as jest.Mock).mockResolvedValue(null);

      const result = await authApi.register({ name: 'T', email: 't@t.com', password: 'password' });

      expect(result).toEqual({ success: false, error: 'Empty response' });
    });
  });

  describe('getValidToken', () => {
    it('returns access token if not expired', async () => {
      (secureSession.getExpiresAt as jest.Mock).mockResolvedValue(Date.now() + 100000);
      (secureSession.getAccessToken as jest.Mock).mockResolvedValue('valid_token');

      const token = await getValidToken();

      expect(token).toBe('valid_token');
      expect(secureSession.getAccessToken).toHaveBeenCalled();
    });

    it('refreshes token if near expiry', async () => {
      (secureSession.getExpiresAt as jest.Mock).mockResolvedValue(Date.now() + 10000);
      (secureSession.getRefreshToken as jest.Mock).mockResolvedValue('refresh_token');
      (secureSession.getStoredUser as jest.Mock).mockResolvedValue({ _id: 'user123' });

      const mockRefreshResponse = {
        success: true,
        data: { accessToken: 'new_token', refreshToken: 'new_refresh', accessTokenExpiresIn: '60' }
      };

      (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
      (readJson as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const token = await getValidToken();

      expect(apiFetch).toHaveBeenCalledWith('/users/refresh-token', expect.objectContaining({
        body: JSON.stringify({ userId: 'user123', refreshToken: 'refresh_token' })
      }));
      expect(secureSession.saveSession).toHaveBeenCalled();
      expect(token).toBe('new_token');
    });

    it('clears session if refresh fails', async () => {
      (secureSession.getExpiresAt as jest.Mock).mockResolvedValue(Date.now() + 10000);
      (secureSession.getRefreshToken as jest.Mock).mockResolvedValue('refresh_token');
      (secureSession.getStoredUser as jest.Mock).mockResolvedValue({ _id: 'user123' });

      (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
      (readJson as jest.Mock).mockResolvedValue({ success: false, error: 'Refresh failed' });

      const token = await getValidToken();

      expect(secureSession.clearSession).toHaveBeenCalled();
      expect(token).toBeNull();
    });

    it('returns null and clears session if no refresh token exists', async () => {
      (secureSession.getExpiresAt as jest.Mock).mockResolvedValue(Date.now() + 10000);
      (secureSession.getRefreshToken as jest.Mock).mockResolvedValue(null);
      (secureSession.getStoredUser as jest.Mock).mockResolvedValue({ _id: 'user123' });

      const token = await getValidToken();

      expect(secureSession.clearSession).toHaveBeenCalled();
      expect(token).toBeNull();
    });
  });
});
