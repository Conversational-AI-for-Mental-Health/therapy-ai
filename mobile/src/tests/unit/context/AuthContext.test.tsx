/// <reference types="jest" />
import React from 'react';
import { Text, Button } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../services/authApi';
import * as secureSession from '../../../services/secureSession';

jest.mock('../../../services/authApi', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
  persistAuthData: jest.fn(),
  clearSession: jest.fn(),
  getStoredUser: jest.fn(),
  getValidToken: jest.fn(),
}));

jest.mock('../../../services/secureSession', () => ({
  getRefreshToken: jest.fn(),
}));

const TestComponent = () => {
  const { user, isLoggedIn, isLoading, login, logout } = useAuth();

  if (isLoading) return <Text>Loading...</Text>;
  if (!isLoggedIn) return (
    <Button title="Login" onPress={() => login('test@test.com', 'pass')} />
  );

  return (
    <>
      <Text>{user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initially shows loading and then restores user if available', async () => {
    const mockUser = { _id: '1', name: 'Restored User', email: 'test@t.com' };
    const { getStoredUser } = require('../../../services/authApi');
    (getStoredUser as jest.Mock).mockResolvedValue(mockUser);

    const { getByText, queryByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText('Loading...')).toBeTruthy();

    await waitFor(() => {
      expect(queryByText('Loading...')).toBeNull();
      expect(getByText('Restored User')).toBeTruthy();
    });
  });

  it('shows login button if no user is restored', async () => {
    const { getStoredUser } = require('../../../services/authApi');
    (getStoredUser as jest.Mock).mockResolvedValue(null);

    const { getByText, queryByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(queryByText('Loading...')).toBeNull();
      expect(getByText('Login')).toBeTruthy();
    });
  });

  it('handles successful login flow', async () => {
    const { getStoredUser } = require('../../../services/authApi');
    (getStoredUser as jest.Mock).mockResolvedValue(null);
    (authApi.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: { _id: '2', name: 'New User', email: 't@t.com' },
        accessToken: 'abc',
        refreshToken: 'def'
      }
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('New User')).toBeTruthy();
    });
  });

  it('handles logout flow properly', async () => {
    const mockUser = { _id: '1', name: 'Logout Target', email: 'test@t.com' };
    const { getStoredUser, clearSession } = require('../../../services/authApi');
    (getStoredUser as jest.Mock).mockResolvedValue(mockUser);

    const { getByText, queryByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Logout Target')).toBeTruthy();
    });

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(queryByText('Logout Target')).toBeNull();
      expect(getByText('Login')).toBeTruthy();
      expect(clearSession).toHaveBeenCalled();
    });
  });
});
