/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import JournalPanel from '../../components/JournalPanel';

jest.mock('../../services/apiClient', () => ({
  apiFetch: jest.fn(),
  readJson: jest.fn(),
}));

jest.mock('../../services/authApi', () => ({
  getValidToken: jest.fn().mockResolvedValue('test-token'),
  getStoredUser: jest.fn().mockResolvedValue({ _id: 'foo' }),
  persistAuthData: jest.fn(),
  clearSession: jest.fn(),
}));

describe('Integration: Journal Flow', () => {
  const { apiFetch, readJson } = require('../../services/apiClient');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches existing journals and allows creating a new one', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true });

    (readJson as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [
        { _id: '1', text: 'Downloaded entry', mood: 'Sad', moodIcon: '😢', createdAt: new Date().toISOString() }
      ]
    });

    const { getByText, getByPlaceholderText, getAllByText } = renderWithProviders(<JournalPanel />);

    await waitFor(() => {
      expect(getByText('Downloaded entry')).toBeTruthy();
    });

    (readJson as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { _id: '2', text: 'Brand new entry integration', mood: 'Happy', moodIcon: '😊', createdAt: new Date().toISOString() }
    });

    fireEvent.press(getAllByText('😊')[0]);
    fireEvent.changeText(getByPlaceholderText("Start today's entry..."), 'Brand new entry integration');
    fireEvent.press(getByText('Save Entry'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(2);
      expect(getByText('Brand new entry integration')).toBeTruthy();
    });
  });
});
