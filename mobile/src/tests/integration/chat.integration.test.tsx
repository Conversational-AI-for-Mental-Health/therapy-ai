/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DashboardScreen from '../../screens/DashboardScreen';
import { apiFetch, readJson } from '../../services/apiClient';

jest.mock('../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: true,
  }),
  AuthProvider: ({ children }: any) => children,
}));

describe('Integration: Chat Flow', () => {
  const navigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows sending a chat message and placing AI response to screen', async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValue({ ok: true } as any);

    (readJson as jest.MockedFunction<typeof readJson>).mockResolvedValueOnce({
      success: true,
      data: [],
      pagination: { hasMore: false },
    });

    const { getByPlaceholderText, getByText, queryByText } =
      renderWithProviders(<DashboardScreen navigation={navigation as any} />);

    await waitFor(() => {
      expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    });

    const input = getByPlaceholderText('Type your message...');

    fireEvent.changeText(input, 'I feel stressed');

    (readJson as jest.MockedFunction<typeof readJson>).mockResolvedValueOnce({
      success: true,
      data: {
        conversationId: 'chat_123',
        conversationTitle: 'Stress Conversation',
        isNewConversation: true,
        aiMessage: { id: 'msg2', text: 'I understand you feel stressed.' },
      },
    });

    fireEvent.press(getByText('➤'));

    expect(getByText('I feel stressed')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('I understand you feel stressed.')).toBeTruthy();
    });

    fireEvent.press(getByText('☰'));
    await waitFor(() => {
      expect(getByText('Stress Conversation')).toBeTruthy();
    });
  });

  it('handles chat sending failure gracefully', async () => {
    (apiFetch as jest.MockedFunction<typeof apiFetch>).mockResolvedValue({ ok: true } as any);
    (readJson as jest.MockedFunction<typeof readJson>).mockResolvedValueOnce({
      success: true,
      data: [],
      pagination: { hasMore: false },
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <DashboardScreen navigation={navigation as any} />,
    );

    await waitFor(() => {
      expect(getByText('AI Chat')).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText('Type your message...'),
      'Fail message',
    );

    (readJson as jest.MockedFunction<typeof readJson>).mockResolvedValueOnce({
      success: false,
      error: 'Backend down',
    });

    fireEvent.press(getByText('➤'));

    await waitFor(() => {
      expect(
        getByText("I'm having trouble connecting right now. Please try again."),
      ).toBeTruthy();
    });
  });
});
