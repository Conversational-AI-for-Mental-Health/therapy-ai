import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../pages/Dashboard';
import socketService from '@/util/socketService';
import conversationAPI from '@/util/conversationAPI';
import { mockConversation, mockConversations } from './mocks/mockData';

jest.mock('@/util/socketService', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    joinConversation: jest.fn(),
    sendMessage: jest.fn(),
    onAIMessage: jest.fn(),
    onError: jest.fn(),
    removeAllListeners: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

jest.mock('@/util/conversationAPI', () => ({
  __esModule: true,
  default: {
    createConversation: jest.fn(),
    getAllConversations: jest.fn(),
    getConversation: jest.fn(),
    updateTitle: jest.fn(),
    archiveConversation: jest.fn(),
    unarchiveConversation: jest.fn(),
    deleteConversation: jest.fn(),
  },
}));

jest.mock('@/util/authAPI', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn().mockReturnValue({
      name: 'Jamie Reed',
      email: 'jamie.r@example.com',
    }),
    logout: jest.fn(),
  },
}));

jest.mock('@/util/emergencyAPI', () => ({
  __esModule: true,
  default: {
    requestProfessionalSupport: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('DashboardPage', () => {
  const mockOnNavigate = jest.fn();
  const mockSetIsDarkMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (conversationAPI.getAllConversations as jest.Mock).mockResolvedValue(
      mockConversations,
    );
    (conversationAPI.getConversation as jest.Mock).mockResolvedValue(
      mockConversation,
    );
    (conversationAPI.createConversation as jest.Mock).mockResolvedValue(
      mockConversation,
    );
  });

  it('loads initial data and renders tabs', async () => {
    render(
      <DashboardPage
        onNavigate={mockOnNavigate}
        isDarkMode={false}
        setIsDarkMode={mockSetIsDarkMode}
      />,
    );

    await waitFor(() => {
      expect(conversationAPI.getAllConversations).toHaveBeenCalled();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Journal')).toBeInTheDocument();
    });
  });

  it('connects socket on mount and disconnects on unmount', async () => {
    const { unmount } = render(
      <DashboardPage
        onNavigate={mockOnNavigate}
        isDarkMode={false}
        setIsDarkMode={mockSetIsDarkMode}
      />,
    );

    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    unmount();
    expect(socketService.removeAllListeners).toHaveBeenCalled();
    expect(socketService.disconnect).toHaveBeenCalled();
  });

  it('toggles dark mode from the header button', async () => {
    const user = userEvent.setup();
    render(
      <DashboardPage
        onNavigate={mockOnNavigate}
        isDarkMode={false}
        setIsDarkMode={mockSetIsDarkMode}
      />,
    );

    await user.click(screen.getByText('🌙'));
    expect(mockSetIsDarkMode).toHaveBeenCalledWith(true);
  });

  it('switches to journal tab', async () => {
    const user = userEvent.setup();
    render(
      <DashboardPage
        onNavigate={mockOnNavigate}
        isDarkMode={false}
        setIsDarkMode={mockSetIsDarkMode}
      />,
    );

    await user.click(screen.getByText('Journal'));
    expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
  });

  it('sends a message through socket for active conversation', async () => {
    const user = userEvent.setup();
    render(
      <DashboardPage
        onNavigate={mockOnNavigate}
        isDarkMode={false}
        setIsDarkMode={mockSetIsDarkMode}
      />,
    );

    const input = await screen.findByPlaceholderText('Type your message...');
    await user.type(input, 'Hello AI');
    await user.click(screen.getByRole('button', { name: '→' }));

    await waitFor(() => {
      expect(socketService.sendMessage).toHaveBeenCalledWith(
        mockConversation._id,
        'Hello AI',
      );
    });
  });
});
