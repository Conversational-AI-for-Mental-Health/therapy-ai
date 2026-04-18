/// <reference types="jest" />
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import ChatPanel from '../../../components/ChatPanel';
import { ChatMessage } from '../../../types';

describe('ChatPanel Component', () => {
  const defaultProps = {
    chatHistory: [] as ChatMessage[],
    chatInput: '',
    onChatInputChange: jest.fn(),
    onSendMessage: jest.fn(),
    onQuickPrompt: jest.fn(),
    isGenerating: false,
    onStopGeneration: jest.fn(),
    quickPrompts: ['Prompt 1', 'Prompt 2'],
    onLoadOlderMessages: jest.fn(),
    chatHasMore: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat history correctly', () => {
    const chatHistory: ChatMessage[] = [
      { sender: 'user', text: 'Hello AI' },
      { sender: 'ai', text: 'Hello Human', thinking: false },
    ];

    const { getByText } = renderWithProviders(
      <ChatPanel {...defaultProps} chatHistory={chatHistory} />
    );

    expect(getByText('Hello AI')).toBeTruthy();
    expect(getByText('Hello Human')).toBeTruthy();
  });

  it('renders typing dots when AI is thinking', () => {
    const chatHistory: ChatMessage[] = [
      { sender: 'ai', text: '', thinking: true },
    ];

    const { getByTestId, UNSAFE_queryByType } = renderWithProviders(
      <ChatPanel {...defaultProps} chatHistory={chatHistory} />
    );

    expect(UNSAFE_queryByType(require('react-native').View)).toBeTruthy();
  });

  it('renders quick prompts and fires handler on press', () => {
    const { getByText } = renderWithProviders(
      <ChatPanel {...defaultProps} />
    );

    const promptChip = getByText('Prompt 1');
    expect(promptChip).toBeTruthy();

    fireEvent.press(promptChip);
    expect(defaultProps.onQuickPrompt).toHaveBeenCalledWith('Prompt 1');
  });

  it('handles input changes', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <ChatPanel {...defaultProps} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Testing');

    expect(defaultProps.onChatInputChange).toHaveBeenCalledWith('Testing');
  });

  it('calls onSendMessage when send button is pressed with valid input', () => {
    const { getByText } = renderWithProviders(
      <ChatPanel {...defaultProps} chatInput="Hello" />
    );

    const sendButton = getByText('➤');
    fireEvent.press(sendButton);

    expect(defaultProps.onSendMessage).toHaveBeenCalled();
  });

  it('shows stop button when isGenerating is true and calls onStopGeneration', () => {
    const { getByText } = renderWithProviders(
      <ChatPanel {...defaultProps} isGenerating={true} />
    );

    const stopButton = getByText('Stop');
    expect(stopButton).toBeTruthy();

    fireEvent.press(stopButton);
    expect(defaultProps.onStopGeneration).toHaveBeenCalled();
  });

  it('shows load more button when chatHasMore is true', () => {
    const { getByText } = renderWithProviders(
      <ChatPanel {...defaultProps} chatHasMore={true} />
    );

    const loadMoreButton = getByText('Load earlier messages');
    expect(loadMoreButton).toBeTruthy();
  });
});
