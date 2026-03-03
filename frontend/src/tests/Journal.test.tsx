import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Journal from '../components/layout/Journal';
import { mockMoodOptions } from './mocks/mockData';
import * as api from '../util/api';

jest.mock('../util/api');

describe('Journal Component', () => {
  const defaultProps = {
    moodOptions: mockMoodOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.callBackendAPI as jest.Mock).mockResolvedValue(
      'This is a thoughtful reflection on your entry.',
    );
  });

  describe('Rendering', () => {
    it('should render journal component with all elements', () => {
      render(<Journal {...defaultProps} />);

      expect(
        screen.getByText('How are you feeling today?'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Select a mood and write down your thoughts.'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Start today's entry..."),
      ).toBeInTheDocument();
      expect(screen.getByText('Save Entry')).toBeInTheDocument();
    });

    it('should render all mood options', () => {
      render(<Journal {...defaultProps} />);

      mockMoodOptions.forEach((option) => {
        const elements = screen.getAllByText(option.moodIcon);
        expect(elements.length).toBeGreaterThan(0);
        const moodButton = elements[0].closest(`[data-mood="${option.mood}"]`);
        expect(moodButton).toBeInTheDocument();
      });
    });

    it('should render recent entries section', () => {
      render(<Journal {...defaultProps} />);

      expect(screen.getByText('Recent Entries')).toBeInTheDocument();
    });
  });

  describe('Mood Selection', () => {
    it('should select mood when mood icon is clicked', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const moodElement = happyMood.closest('.mood-icon');
      expect(moodElement).toHaveClass('selected');
    });

    it('should allow changing mood selection', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      const sadMood = screen.getByText('😢');

      await user.click(happyMood);
      await user.click(sadMood);

      expect(sadMood.closest('.mood-icon')).toHaveClass('selected');
      expect(happyMood.closest('.mood-icon')).not.toHaveClass('selected');
    });
  });

  describe('Journal Entry Creation', () => {
    it('should allow typing in journal text area', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Today was a good day');

      expect(textarea).toHaveValue('Today was a good day');
    });

    it('should save entry with mood and text', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Today was wonderful');

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Today was wonderful/)).toBeInTheDocument();
        expect(screen.getByText(/Feeling Happy/)).toBeInTheDocument();
      });
    });

    it('should show alert when saving without mood', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Journal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Text without mood');

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith(
        'Please select a mood and write an entry.',
      );
      alertSpy.mockRestore();
    });

    it('should show alert when saving without text', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith(
        'Please select a mood and write an entry.',
      );
      alertSpy.mockRestore();
    });

    it('should clear form after saving entry', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Test entry');

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        expect(textarea).toHaveValue('');
        expect(happyMood.closest('.mood-icon')).not.toHaveClass('selected');
      });
    });
  });

  describe('Word Count Validation', () => {
    it('should display word count for entries', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      const shortText = 'This is a short entry';
      await user.type(textarea, shortText);

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const wordCount = shortText.split(/\s+/).length;
        expect(
          screen.getByText(new RegExp(`${wordCount} words`)),
        ).toBeInTheDocument();
      });
    });

    it('should show how many more words needed for insights', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      const text = 'Short entry with only few words';
      await user.type(textarea, text);

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const wordCount = text.split(/\s+/).length;
        const remaining = 100 - wordCount;
        expect(
          screen.getByText(new RegExp(`${remaining} more needed for insights`)),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Entry Display', () => {
    it('should display entries with correct date format', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Test entry for date');

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const today = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        expect(screen.getByText(new RegExp(today))).toBeInTheDocument();
      });
    });

    it('should show mood icon in entry list', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const sadMood = screen.getByText('😢');
      await user.click(sadMood);

      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Sad day today');

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const entryElements = screen.getAllByText('😢');
        expect(entryElements.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Insights Feature', () => {
    it('should disable insights button for entries under 100 words', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);
      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, 'Short entry');

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);
      await waitFor(() => {
        const viewButton = screen.getAllByTitle(/View full entry/)[0];
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        const insightsButton = screen
          .getByText('Get Insights')
          .closest('button');
        expect(insightsButton).toBeDisabled();
      });
    });

    it('should open insights modal when insights button is clicked', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const longText = Array(101).fill('word').join(' ');
      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, longText);

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const viewButton = screen.getAllByTitle(/View full entry/)[0];
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        const insightsButton = screen.getByText('Get Insights');
        fireEvent.click(insightsButton);
      });

      await waitFor(() => {
        expect(screen.getByText('✨ Reflection on your day')).toBeInTheDocument();
      });
    });

    it('should display loading state while fetching insights', async () => {
      const user = userEvent.setup();
      (api.callBackendAPI as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('Insights'), 1000)),
      );

      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const longText = Array(101).fill('word').join(' ');
      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, longText);

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const viewButton = screen.getAllByTitle(/View full entry/)[0];
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        const insightsButton = screen.getByText('Get Insights');
        fireEvent.click(insightsButton);
      });

      const loadingIndicators = screen
        .getAllByRole('generic')
        .filter((el) => el.querySelector('.lds-ellipsis'));
      expect(loadingIndicators.length).toBeGreaterThan(0);
    });

    it('should close insights modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);

      const happyMood = screen.getByText('😊');
      await user.click(happyMood);

      const longText = Array(101).fill('word').join(' ');
      const textarea = screen.getByPlaceholderText("Start today's entry...");
      await user.type(textarea, longText);

      const saveButton = screen.getByText('Save Entry');
      await user.click(saveButton);

      await waitFor(() => {
        const viewButton = screen.getAllByTitle(/View full entry/)[0];
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        const insightsButton = screen.getByText('Get Insights');
        fireEvent.click(insightsButton);
      });

      await waitFor(() => {
        expect(screen.getByText('✨ Reflection on your day')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByText('Close');
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(
          screen.queryByText('✨ Reflection on your day'),
        ).not.toBeInTheDocument();
      });
    });
  });
});
