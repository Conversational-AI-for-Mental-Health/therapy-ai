/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import JournalPanel from '../../../components/JournalPanel';
import journalApi from '../../../services/journalApi';

jest.mock('../../../services/journalApi', () => ({
  getEntries: jest.fn(),
  createEntry: jest.fn(),
  deleteEntry: jest.fn(),
}));

describe('JournalPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial setup correctly', async () => {
    (journalApi.getEntries as jest.Mock).mockResolvedValue([]);

    const { getByText, getByPlaceholderText } = renderWithProviders(<JournalPanel />);

    expect(getByText('How are you feeling today?')).toBeTruthy();
    expect(getByPlaceholderText("Start today's entry...")).toBeTruthy();
    expect(getByText('Save Entry')).toBeTruthy();
  });

  it('validates empty state before saving', async () => {
    (journalApi.getEntries as jest.Mock).mockResolvedValue([]);

    const { getByText } = renderWithProviders(<JournalPanel />);

    fireEvent.press(getByText('Save Entry'));
    expect(getByText('Please select a mood')).toBeTruthy();
  });

  it('validates missing text before saving', async () => {
    (journalApi.getEntries as jest.Mock).mockResolvedValue([]);

    const { getByText, getAllByText } = renderWithProviders(<JournalPanel />);

    const happyBtn = getAllByText('😊')[0];
    fireEvent.press(happyBtn);

    fireEvent.press(getByText('Save Entry'));
    expect(getByText('Please write something')).toBeTruthy();
  });

  it('saves entry and fetches lists successfully', async () => {
    const mockEntries = [
      { _id: '1', text: 'Old entry', mood: 'Calm', moodIcon: '😌', createdAt: new Date().toISOString() },
    ];
    (journalApi.getEntries as jest.Mock).mockResolvedValue(mockEntries);
    (journalApi.createEntry as jest.Mock).mockResolvedValue({
      _id: '2', text: 'New text', mood: 'Happy', moodIcon: '😊', createdAt: new Date().toISOString()
    });

    const { getByText, getByPlaceholderText, getAllByText, queryByText } = renderWithProviders(<JournalPanel />);

    await waitFor(() => {
      expect(getByText('Old entry')).toBeTruthy();
    });

    const happyBtn = getAllByText('😊')[0];
    fireEvent.press(happyBtn);

    const input = getByPlaceholderText("Start today's entry...");
    fireEvent.changeText(input, 'New text');

    fireEvent.press(getByText('Save Entry'));

    await waitFor(() => {
      expect(journalApi.createEntry).toHaveBeenCalledWith('New text', 'Happy', '😊');
      expect(getByText('New text')).toBeTruthy();
    });
  });

  it('allows expanding an entry', async () => {
    const mockEntries = [
      { _id: '1', text: 'Long text here that is normally truncated', mood: 'Calm', moodIcon: '😌', createdAt: new Date().toISOString() },
    ];
    (journalApi.getEntries as jest.Mock).mockResolvedValue(mockEntries);

    const { getByText, queryByText } = renderWithProviders(<JournalPanel />);

    await waitFor(() => {
      expect(getByText('Long text here that is normally truncated')).toBeTruthy();
    });

    const entryPreview = getByText('Long text here that is normally truncated');
    fireEvent.press(entryPreview);

    expect(getByText('▲')).toBeTruthy();
  });
});
