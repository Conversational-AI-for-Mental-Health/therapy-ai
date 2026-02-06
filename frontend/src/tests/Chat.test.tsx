import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../components/layout/Chat';
import {
  mockChatMessages,
  mockQuickPrompts,
  mockThinkingMessage,
} from './mocks/mockData';

describe('Chat Component', () => {
  const mockChatHistoryRef = React.createRef<HTMLDivElement>();
  const mockHandleQuickPrompt = jest.fn();
  const mockHandleSubmitForm = jest.fn();
  const mockHandleMessageFeedback = jest.fn();
  const mockOnChatInputChange = jest.fn();

  const defaultProps = {
    chatHistory: mockChatMessages,
    chatHistoryRef: mockChatHistoryRef,
    quickPrompts: mockQuickPrompts,
    chatInput: '',
    onChatInputChange: mockOnChatInputChange,
    handleQuickPrompt: mockHandleQuickPrompt,
    handleSubmitForm: mockHandleSubmitForm,
    handleMessageFeedback: mockHandleMessageFeedback,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chat component with all elements', () => {
      render(<Chat {...defaultProps} />);

      expect(screen.getByText('Quick Prompts')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Type your message...'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '→' })).toBeInTheDocument();
    });

    it('should render all quick prompts', () => {
      render(<Chat {...defaultProps} />);

      mockQuickPrompts.forEach((prompt) => {
        expect(screen.getByText(prompt)).toBeInTheDocument();
      });
    });

    it('should render chat history messages', () => {
      render(<Chat {...defaultProps} />);

      mockChatMessages.forEach((message) => {
        expect(screen.getByText(message.text)).toBeInTheDocument();
      });
    });

    it('should display thinking indicator for AI messages', () => {
      const propsWithThinking = {
        ...defaultProps,
        chatHistory: [...mockChatMessages, mockThinkingMessage],
      };

      render(<Chat {...propsWithThinking} />);

      const thinkingIndicators = screen
        .getAllByRole('generic')
        .filter((el) => el.querySelector('.lds-ellipsis'));
      expect(thinkingIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onChatInputChange when typing in input', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'Hello');

      expect(mockOnChatInputChange).toHaveBeenCalledWith('H');
      expect(mockOnChatInputChange).toHaveBeenCalledWith('e');
      expect(mockOnChatInputChange).toHaveBeenCalledWith('l');
      expect(mockOnChatInputChange).toHaveBeenCalledWith('l');
      expect(mockOnChatInputChange).toHaveBeenCalledWith('o');
    });

    it('should call handleSubmitForm when form is submitted', async () => {
      render(<Chat {...defaultProps} chatInput="Hello" />);

      const form = screen.getByRole('button', { name: '→' }).closest('form');
      fireEvent.submit(form!);

      expect(mockHandleSubmitForm).toHaveBeenCalledTimes(1);
    });

    it('should call handleQuickPrompt when quick prompt button is clicked', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const quickPromptButton = screen.getByText(mockQuickPrompts[0]);
      await user.click(quickPromptButton);

      expect(mockHandleQuickPrompt).toHaveBeenCalledWith(mockQuickPrompts[0]);
    });
  });

  describe('Message Feedback', () => {
    it('should display feedback buttons for AI messages', () => {
      render(<Chat {...defaultProps} />);

      const aiMessages = mockChatMessages.filter(
        (msg) => msg.sender === 'ai' && !msg.thinking,
      );
      const thumbsUpButtons = screen.getAllByTitle('Helpful response');
      const thumbsDownButtons = screen.getAllByTitle('Not helpful');

      expect(thumbsUpButtons).toHaveLength(aiMessages.length);
      expect(thumbsDownButtons).toHaveLength(aiMessages.length);
    });

    it('should not display feedback buttons for user messages', () => {
      const userOnlyMessages = [
        { sender: 'user' as const, text: 'User message 1' },
        { sender: 'user' as const, text: 'User message 2' },
      ];

      render(<Chat {...defaultProps} chatHistory={userOnlyMessages} />);

      expect(screen.queryByTitle('Helpful response')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Not helpful')).not.toBeInTheDocument();
    });

    it('should call handleMessageFeedback with correct parameters on thumbs up', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const thumbsUpButton = screen.getAllByTitle('Helpful response')[0];
      await user.click(thumbsUpButton);

      expect(mockHandleMessageFeedback).toHaveBeenCalledWith(0, 'positive');
    });

    it('should call handleMessageFeedback with correct parameters on thumbs down', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const thumbsDownButton = screen.getAllByTitle('Not helpful')[0];
      await user.click(thumbsDownButton);

      expect(mockHandleMessageFeedback).toHaveBeenCalledWith(0, 'negative');
    });

    it('should apply active styling to positive feedback', () => {
      const messagesWithFeedback = [
        {
          sender: 'ai' as const,
          text: 'AI message',
          feedback: 'positive' as const,
        },
      ];

      render(<Chat {...defaultProps} chatHistory={messagesWithFeedback} />);

      const thumbsUpButton = screen.getByTitle('Helpful response');
      expect(thumbsUpButton).toHaveClass('bg-primary/20');
    });

    it('should apply active styling to negative feedback', () => {
      const messagesWithFeedback = [
        {
          sender: 'ai' as const,
          text: 'AI message',
          feedback: 'negative' as const,
        },
      ];

      render(<Chat {...defaultProps} chatHistory={messagesWithFeedback} />);

      const thumbsDownButton = screen.getByTitle('Not helpful');
      expect(thumbsDownButton).toHaveClass('bg-primary/20');
    });
  });

  describe('Chat Input', () => {
    it('should display the current chat input value', () => {
      render(<Chat {...defaultProps} chatInput="Test message" />);

      const input = screen.getByPlaceholderText('Type your message...');
      expect(input).toHaveValue('Test message');
    });

    it('should have proper placeholder text', () => {
      render(<Chat {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Type your message...'),
      ).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('should display user messages on the right', () => {
      const userMessage = { sender: 'user' as const, text: 'User message' };
      render(<Chat {...defaultProps} chatHistory={[userMessage]} />);

      const messageElement = screen.getByText('User message');
      const messageContainer = messageElement.parentElement?.parentElement;
      expect(messageContainer).toHaveClass('justify-end');
    });

    it('should display AI messages on the left', () => {
      const aiMessage = { sender: 'ai' as const, text: 'AI message' };
      render(<Chat {...defaultProps} chatHistory={[aiMessage]} />);

      const messageElement = screen.getByText('AI message');
      const messageContainer = messageElement.parentElement?.parentElement;
      expect(messageContainer).toHaveClass('justify-start');
    });

    it('should apply correct styling to user messages', () => {
      const userMessage = { sender: 'user' as const, text: 'User message' };
      render(<Chat {...defaultProps} chatHistory={[userMessage]} />);

      const messageElement = screen.getByText('User message');
      expect(messageElement).toHaveClass('bg-primary', 'text-white');
    });

    it('should apply correct styling to AI messages', () => {
      const aiMessage = { sender: 'ai' as const, text: 'AI message' };
      render(<Chat {...defaultProps} chatHistory={[aiMessage]} />);

      const messageElement = screen.getByText('AI message');
      expect(messageElement).toHaveClass('bg-surface');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type your message...');
      expect(input).toHaveAttribute('type', 'text');

      const submitButton = screen.getByRole('button', { name: '→' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have title attributes on feedback buttons', () => {
      render(<Chat {...defaultProps} />);

      expect(screen.getAllByTitle('Helpful response')[0]).toBeInTheDocument();
      expect(screen.getAllByTitle('Not helpful')[0]).toBeInTheDocument();
    });
  });
});
