/// <reference types="jest" />
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import Sidebar from '../../../components/Sidebar';

describe('Sidebar Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onNewConversation: jest.fn(),
    chatSessions: [],
    currentChatId: null,
    onSelectChat: jest.fn(),
    onDeleteChat: jest.fn(),
    onContactProfessional: jest.fn(),
    onNavigate: jest.fn(),
    user: { name: 'Test User', email: 'test@t.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user details properly', () => {
    const { getByText } = renderWithProviders(<Sidebar {...defaultProps} />);
    expect(getByText('T')).toBeTruthy();
    expect(getByText('Test')).toBeTruthy();
  });

  it('renders empty chat list message', () => {
    const { getByText } = renderWithProviders(<Sidebar {...defaultProps} />);
    expect(getByText('No previous chats yet')).toBeTruthy();
  });

  it('renders list of sessions and selects them', () => {
    const chatSessions = [
      { id: '1', title: 'First Chat', preview: 'Hi', timestamp: 'Today' },
      { id: '2', title: 'Second Chat', preview: 'Hello', timestamp: 'Yesterday' }
    ];

    const { getByText } = renderWithProviders(<Sidebar {...defaultProps} chatSessions={chatSessions} />);

    const chatItem = getByText('First Chat');
    expect(chatItem).toBeTruthy();

    fireEvent.press(chatItem);
    expect(defaultProps.onSelectChat).toHaveBeenCalledWith('1');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('triggers new conversation on button press', () => {
    const { getByText } = renderWithProviders(<Sidebar {...defaultProps} />);

    const newBtn = getByText('✏️  New Conversation');
    fireEvent.press(newBtn);

    expect(defaultProps.onNewConversation).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('triggers contact professional modal', () => {
    const { getByText } = renderWithProviders(<Sidebar {...defaultProps} />);

    const contactBtn = getByText('🧑‍⚕️  Contact Professional');
    fireEvent.press(contactBtn);

    expect(defaultProps.onContactProfessional).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
