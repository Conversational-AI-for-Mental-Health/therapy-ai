import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Journal from '../components/layout/Journal';
import { mockMoodOptions, mockJournalEntries, mockLongJournalEntry } from './mocks/mockData';
import * as api from '../util/api';
import journalAPI from '../util/journalAPI';

// Mock the APIs
jest.mock('../util/api');
jest.mock('../util/journalAPI', () => ({
  __esModule: true,
  default: {
    getEntries: jest.fn(),
    createEntry: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
  },
}));

describe('Journal Component', () => {
  const defaultProps = {
    moodOptions: mockMoodOptions,
  };

  const allEntries = [...mockJournalEntries, mockLongJournalEntry];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.callBackendAPI as jest.Mock).mockResolvedValue(
      'This is a thoughtful reflection on your entry.',
    );
    (journalAPI.getEntries as jest.Mock).mockResolvedValue(allEntries);
  });

  const setup = async () => {
    const user = userEvent.setup();
    const { container } = render(<Journal {...defaultProps} />);
    await waitFor(() => expect(journalAPI.getEntries).toHaveBeenCalled());
    return { user, container };
  };

  describe('Rendering', () => {
    it('should render journal component with all elements', async () => {
      await setup();
      expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Start today's entry...")).toBeInTheDocument();
      expect(screen.getByText('Save Entry')).toBeInTheDocument();
    });
  });

  describe('Mood Selection', () => {
    it('should select mood when clicked', async () => {
      const { user, container } = await setup();
      const moodOptions = container.querySelector('[data-cy="mood-options"]');
      const happyIcon = moodOptions?.querySelector('[data-mood="Happy"]');
      if (!happyIcon) throw new Error('Happy icon not found');
      await user.click(happyIcon);
      expect(happyIcon).toHaveClass('selected');
    });
  });

  describe('Journal Entry Creation', () => {
    it('should save entry and display it', async () => {
      const { user, container } = await setup();
      const moodOptions = container.querySelector('[data-cy="mood-options"]');
      const happyIcon = moodOptions?.querySelector('[data-mood="Happy"]');
      if (!happyIcon) throw new Error('Happy icon not found');
      await user.click(happyIcon);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      const entryText = 'My new personal unique journal entry';
      await user.type(textarea, entryText);

      (journalAPI.createEntry as jest.Mock).mockResolvedValue({
        _id: 'new-id-123',
        createdAt: new Date().toISOString(),
        mood: 'Happy',
        moodIcon: '😊',
        text: entryText,
      });

      await user.click(screen.getByText('Save Entry'));

      await waitFor(() => {
        expect(screen.getByText(new RegExp(entryText))).toBeInTheDocument();
      });
    });

    it('should show error message when required fields missing', async () => {
      const { user } = await setup();
      await user.click(screen.getByText('Save Entry'));
      await waitFor(() => {
        expect(screen.getByText('Please select a mood and write an entry.')).toBeInTheDocument();
      });
    });
  });

  describe('Insights Feature', () => {
    it('should handle insights flow for long entries', async () => {
      const { user, container } = await setup();

      // Use mockLongJournalEntry which is definitely > 100 words
      const longEntry = mockLongJournalEntry;
      const entryEl = container.querySelector(`[data-cy="journal-entry-${longEntry._id}"]`);
      if (!entryEl) throw new Error(`Long entry element ${longEntry._id} not found`);

      // Expand it
      const viewBtn = entryEl.querySelector('button[title="View full entry"]') || entryEl.querySelector('button[title="Collapse"]');
      if (viewBtn) fireEvent.click(viewBtn);

      // Verify that the textarea with the long text is visible or the text is present
      expect(await screen.findByText(longEntry.text)).toBeInTheDocument();

      const insightsBtn = await screen.findByRole('button', { name: /Get Insights/i });
      await user.click(insightsBtn);

      // Verify modal content 
      await waitFor(() => {
        // Find by partial text regardless of emoji prefix
        expect(screen.getByText(/Reflection on your day/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const closeBtn = screen.getByRole('button', { name: /Close/i });
      await user.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Reflection on your day/i)).not.toBeInTheDocument();
      });
    });

    it('should disable insights for short entries', async () => {
      const { container } = await setup();

      // Third mock entry is short (text includes "This is a short entry")
      const shortEntry = mockJournalEntries[2];
      const entryEl = container.querySelector(`[data-cy="journal-entry-${shortEntry._id}"]`);
      if (!entryEl) throw new Error('Short entry element not found');

      const viewBtn = entryEl.querySelector('button[title="View full entry"]') || entryEl.querySelector('button[title="Expand"]');
      if (viewBtn) fireEvent.click(viewBtn);

      const insightsBtn = await screen.findByRole('button', { name: /Get Insights/i });
      expect(insightsBtn).toBeDisabled();
    });
  });
});
