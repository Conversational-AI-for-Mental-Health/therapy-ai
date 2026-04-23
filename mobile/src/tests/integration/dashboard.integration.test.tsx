/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DashboardScreen from '../../screens/DashboardScreen';

jest.mock('../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'use-auth-id', name: 'Auth User', email: 'auth@test.com' },
    isLoggedIn: true,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

describe('Integration: Dashboard Navigation & Modals', () => {
  const { apiFetch, readJson } = require('../../services/apiClient');

  const navigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });

    (readJson as jest.Mock).mockResolvedValue({ success: true, data: [], pagination: { hasMore: false } });
  });

  it('can toggle between Chat and Journal tabs', async () => {
    const { getByText, queryByPlaceholderText } = renderWithProviders(<DashboardScreen navigation={navigation as any} />);

    await waitFor(() => {
      expect(getByText('AI Chat')).toBeTruthy();
      expect(getByText('Journal')).toBeTruthy();
    });

    expect(queryByPlaceholderText('Type your message...')).toBeTruthy();

    fireEvent.press(getByText('Journal'));

    await waitFor(() => {

      expect(queryByPlaceholderText('Type your message...')).toBeNull();

      expect(queryByPlaceholderText("Start today's entry...")).toBeTruthy();
    });
  });

  it('can open Settings modal and Professional Support modal from top bar and sidebar', async () => {
    const { getByText, queryByText, debug } = renderWithProviders(<DashboardScreen navigation={navigation as any} />);

    await waitFor(() => {
      expect(getByText('AI Chat')).toBeTruthy();
    });

    fireEvent.press(getByText('👤'));
    await waitFor(() => {
      expect(getByText('Data Management')).toBeTruthy();
    });

    fireEvent.press(getByText('☰'));
    await waitFor(() => {
      expect(getByText('✏️  New Conversation')).toBeTruthy();
    });

    fireEvent.press(getByText('🧑‍⚕️  Contact Professional'));

    await waitFor(() => {
      expect(getByText('Contact Professional Support')).toBeTruthy();
      expect(getByText('Your Phone Number (Optional)')).toBeTruthy();
    });
  });
});
