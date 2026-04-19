/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import LoginScreen from '../../screens/LoginScreen';
import SignupScreen from '../../screens/SignupScreen';
import { authApi, getValidToken, clearSession } from '../../services/authApi';
import * as secureSession from '../../services/secureSession';

jest.mock('../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../services/secureSession', () => ({
  saveSession: jest.fn(),
  clearSession: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  getExpiresAt: jest.fn(),
  getStoredUser: jest.fn(),
}));

describe('Integration: Auth Flows', () => {
  const { apiFetch, readJson } = require('../../services/apiClient');

  const navigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (secureSession.getStoredUser as jest.Mock).mockResolvedValue(null);
  });

  it('allows full user registration to navigation', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: { _id: '1', name: 'John', email: 'john@t.com' },
        accessToken: 'access123',
        refreshToken: 'refresh123',
      }
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(<SignupScreen navigation={navigation as any} />);

    await waitFor(() => {
      expect(getByText('Create Account')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@t.com');

    fireEvent.changeText(getByPlaceholderText('Password (min. 8 characters)'), 'longenough');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalled();
      expect(secureSession.saveSession).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: 'access123'
      }));
      expect(navigation.replace).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('allows full login flow', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });
    (readJson as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: { _id: '1', name: 'Jane', email: 'jane@t.com' },
        accessToken: 'valid-access',
        refreshToken: 'valid-refresh',
      }
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen navigation={navigation as any} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'jane@t.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalled();
      expect(secureSession.saveSession).toHaveBeenCalled();
      expect(navigation.replace).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('displays API auth failure via AuthContext propagation', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: false });
    (readJson as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid password'
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen navigation={navigation as any} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'bad@t.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'badpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Login failed')).toBeTruthy();
      expect(secureSession.saveSession).not.toHaveBeenCalled();
      expect(navigation.replace).not.toHaveBeenCalled();
    });
  });
});
