import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../components/layout/Chat';
import {
  mockChatMessages,
  mockSuggestedPrompts,
  mockThinkingMessage,
} from './mocks/mockData';

jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

jest.mock('rehype-sanitize', () => () => { });

describe('Chat Component', () => {
  const mockChatHistoryRef = React.createRef<HTMLDivElement>();
  const mockHandleQuickPrompt = jest.fn();
  const mockHandleSubmitForm = jest.fn();
  const mockHandleMessageFeedback = jest.fn();
  const mockHandleEditUserMessage = jest.fn();
  const mockHandleSelectUserMessageVersion = jest.fn();
  const mockHandleCopyMessage = jest.fn();
  const mockOnChatInputChange = jest.fn();
  const mockOnStopGeneration = jest.fn();
  const mockOnClearSuggestedPrompts = jest.fn();
  const mockOnTogglePrompts = jest.fn();

  const defaultProps = {
    chatHistory: mockChatMessages,
    chatHistoryRef: mockChatHistoryRef,
    showPrompts: false,
    onTogglePrompts: mockOnTogglePrompts,
    quickPrompts: mockSuggestedPrompts,
    chatInput: '',
    onChatInputChange: mockOnChatInputChange,
    handleQuickPrompt: mockHandleQuickPrompt,
    handleSubmitForm: mockHandleSubmitForm,
    handleMessageFeedback: mockHandleMessageFeedback,
    handleEditUserMessage: mockHandleEditUserMessage,
    handleSelectUserMessageVersion: mockHandleSelectUserMessageVersion,
    handleCopyMessage: mockHandleCopyMessage,
    isGenerating: false,
    onStopGeneration: mockOnStopGeneration,
    onClearSuggestedPrompts: mockOnClearSuggestedPrompts,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chat component with all elements', () => {
      render(<Chat {...defaultProps} chatHistory={[]} />);

      expect(screen.getByTitle('Show Suggestions')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '→' })).toBeInTheDocument();
    });

    it('should render quick prompts panel when showPrompts is true', () => {
      const { container } = render(
        <Chat
          {...defaultProps}
          showPrompts={true}
          quickPrompts={mockSuggestedPrompts}
        />,
      );

      expect(container.querySelector('[data-cy="quick-prompts-panel"]')).toBeInTheDocument();
      mockSuggestedPrompts.forEach((prompt) => {
        expect(screen.getByText(prompt)).toBeInTheDocument();
      });
      expect(container.querySelector('[data-cy="suggested-prompts"]')).toBeInTheDocument();
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

      const { container } = render(<Chat {...propsWithThinking} />);
      expect(container.querySelector('[data-cy="thinking-bubble"]')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChatInputChange when typing in input', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'H');

      expect(mockOnChatInputChange).toHaveBeenCalled();
    });

    it('should call handleSubmitForm when form is submitted', async () => {
      render(<Chat {...defaultProps} chatInput="Hello" />);

      const form = screen.getByPlaceholderText('Type your message...').closest('form');
      if (form) fireEvent.submit(form);

      expect(mockHandleSubmitForm).toHaveBeenCalledTimes(1);
    });

    it('should call handleQuickPrompt when dynamic suggested prompt is clicked', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} showPrompts={true} quickPrompts={mockSuggestedPrompts} />);

      const quickPromptButton = screen.getByText(mockSuggestedPrompts[0]);
      await user.click(quickPromptButton);

      expect(mockHandleQuickPrompt).toHaveBeenCalledWith(mockSuggestedPrompts[0]);
    });

    it('should call onTogglePrompts when toggle button clicked', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      await user.click(screen.getByTitle('Show Suggestions'));
      expect(mockOnTogglePrompts).toHaveBeenCalledTimes(1);
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

    it('should call handleMessageFeedback with correct parameters on thumbs up', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const thumbsUpButton = screen.getAllByTitle('Helpful response')[0];
      await user.click(thumbsUpButton);

      expect(mockHandleMessageFeedback).toHaveBeenCalledWith(expect.any(Number), 'positive');
    });

    it('should call handleMessageFeedback with correct parameters on thumbs down', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} />);

      const thumbsDownButton = screen.getAllByTitle('Not helpful')[0];
      await user.click(thumbsDownButton);

      expect(mockHandleMessageFeedback).toHaveBeenCalledWith(expect.any(Number), 'negative');
    });
  });

  describe('Message Display Styling', () => {
    it('should display user messages with correct styling', () => {
      const userMessage = { sender: 'user' as const, text: 'User message' };
      render(<Chat {...defaultProps} chatHistory={[userMessage]} />);

      const messageElement = screen.getByText('User message');
      expect(messageElement).toHaveClass('bg-primary', 'text-white');
    });

    it('should display AI messages with correct styling', () => {
      const aiMessage = { sender: 'ai' as const, text: 'AI message' };
      render(<Chat {...defaultProps} chatHistory={[aiMessage]} />);

      const messageElement = screen.getByText('AI message');
      const bubble = messageElement.closest('.rounded-2xl');
      expect(bubble).toHaveClass('bg-surface');
    });
  });

  describe('Quick Prompts', () => {
    it('should call handleQuickPrompt and onClearSuggestedPrompts when quick prompt clicked', async () => {
      const user = userEvent.setup();
      render(<Chat {...defaultProps} showPrompts={true} quickPrompts={['Tell me more']} />);

      await user.click(screen.getByText('Tell me more'));
      expect(mockHandleQuickPrompt).toHaveBeenCalledWith('Tell me more');
      expect(mockOnClearSuggestedPrompts).toHaveBeenCalled();
    });
  });
});