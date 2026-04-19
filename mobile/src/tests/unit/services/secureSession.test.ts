/// <reference types="jest" />
import * as SecureStore from 'expo-secure-store';
import {
  saveSession,
  clearSession,
  getAccessToken,
  getRefreshToken,
  getExpiresAt,
  getStoredUser,
} from '../../../services/secureSession';

describe('secureSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSession', () => {
    it('saves tokens, user, and correctly calculates expiry', async () => {
      const mockUser = { _id: '1', name: 'Test', email: 'test@t.com' };
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      await saveSession({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: mockUser,
        accessTokenExpiresIn: '60',
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'therapy_ai_at',
        'access-123',
        expect.any(Object)
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'therapy_ai_rt',
        'refresh-456',
        expect.any(Object)
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'therapy_ai_u',
        JSON.stringify(mockUser),
        expect.any(Object)
      );

      const expectedExpiry = now + 60 * 60 * 1000;
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'therapy_ai_exp',
        String(expectedExpiry),
        expect.any(Object)
      );
    });

    it('handles missing accessTokenExpiresIn payload', async () => {
      await saveSession({
        accessToken: 'abc',
        refreshToken: 'def',
        user: { _id: '1', name: 'Test', email: 'test@t.com' },
      });

      expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith(
        'therapy_ai_exp',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('clearSession', () => {
    it('deletes all session keys from secure storage', async () => {
      await clearSession();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('therapy_ai_at');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('therapy_ai_rt');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('therapy_ai_u');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('therapy_ai_exp');
    });
  });

  describe('getters', () => {
    it('getAccessToken retrieves proper key', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-at');
      const token = await getAccessToken();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('therapy_ai_at');
      expect(token).toBe('stored-at');
    });

    it('getRefreshToken retrieves proper key', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-rt');
      const token = await getRefreshToken();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('therapy_ai_rt');
      expect(token).toBe('stored-rt');
    });

    it('getExpiresAt parses numeric string cleanly', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('1700000000000');
      const exp = await getExpiresAt();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('therapy_ai_exp');
      expect(exp).toBe(1700000000000);
    });

    it('getExpiresAt returns 0 if key not found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      const exp = await getExpiresAt();
      expect(exp).toBe(0);
    });

    it('getStoredUser parses stringified object', async () => {
      const mockUser = { _id: '1', name: 'Test', email: 'test@t.com' };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockUser));

      const user = await getStoredUser();
      expect(user).toEqual(mockUser);
    });

    it('getStoredUser returns null on invalid JSON', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('not-valid-json');
      const user = await getStoredUser();
      expect(user).toBeNull();
    });

    it('getStoredUser returns null if nothing is stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      const user = await getStoredUser();
      expect(user).toBeNull();
    });
  });
});
