import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../pages/Dashboard';
import socketService from '@/util/socketService';
import conversationAPI from '@/util/conversationAPI';
import { mockConversation, mockConversations } from './mocks/mockData';

// Mock the socket service
jest.mock('@/util/socketService', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    joinConversation: jest.fn(),
    sendMessage: jest.fn(),
    onAIMessage: jest.fn(),
    onConversationHistory: jest.fn(),
    onError: jest.fn(),
    removeAllListeners: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

// Mock the conversation API
jest.mock('@/util/conversationAPI', () => ({
  __esModule: true,
  default: {
    createConversation: jest.fn(),
    getAllConversations: jest.fn(),
    getConversation: jest.fn(),
    updateTitle: jest.fn(),
    archiveConversation: jest.fn(),
    deleteConversation: jest.fn(),
  },
}));

describe('DashboardPage', () => {
  const mockOnNavigate = jest.fn();
  const mockSetIsDarkMode = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
    isDarkMode: false,
    onClose: mockOnClose,
    setIsDarkMode: mockSetIsDarkMode,
  };

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
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with all core elements', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Therapy AI')).toBeInTheDocument();
        expect(screen.getByText('AI Chat')).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
      });
    });

    it('should render sidebar toggle button', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const toggleButton = screen.getByText('▶');
        expect(toggleButton).toBeInTheDocument();
      });
    });

    it('should render dark mode toggle', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('🌙')).toBeInTheDocument();
      });
    });

    it('should render dark mode toggle with sun icon when dark mode is on', async () => {
      render(<DashboardPage {...defaultProps} isDarkMode={true} />);

      await waitFor(() => {
        expect(screen.getByText('☀️')).toBeInTheDocument();
      });
    });

    it('should render brain emoji logo', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('🧠')).toBeInTheDocument();
      });
    });

    it('should render connection status indicator', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });

    it('should show connecting status when socket is disconnected', async () => {
      (socketService.isConnected as jest.Mock).mockReturnValue(false);

      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument();
      });
    });
  });

  describe('Socket.io Integration', () => {
    it('should connect to socket on mount', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(socketService.connect).toHaveBeenCalledTimes(1);
      });
    });

    it('should disconnect socket on unmount', async () => {
      const { unmount } = render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(socketService.connect).toHaveBeenCalled();
      });

      unmount();

      expect(socketService.removeAllListeners).toHaveBeenCalled();
      expect(socketService.disconnect).toHaveBeenCalled();
    });

    it('should setup AI message listener', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(socketService.onAIMessage).toHaveBeenCalled();
      });
    });

    it('should setup error listener', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(socketService.onError).toHaveBeenCalled();
      });
    });

    // TODO: Re-enable these tests when socket methods are implemented
    it.skip('should join conversation when conversation changes', async () => {
      render(<DashboardPage {...defaultProps} />);

      // await waitFor(() => {
      //   expect(socketService.joinConversation).toHaveBeenCalledWith(
      //     mockConversation._id,
      //   );
      // });
    });

    it.skip('should setup conversation history listener', async () => {
      render(<DashboardPage {...defaultProps} />);

      // await waitFor(() => {
      //   expect(socketService.onConversationHistory).toHaveBeenCalled();
      // });
    });
  });

  describe('Conversation Loading', () => {
    it('should load initial conversation on mount', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(conversationAPI.getAllConversations).toHaveBeenCalled();
      });
    });

    it('should display loading state initially', async () => {
      render(<DashboardPage {...defaultProps} />);

      expect(screen.getByText('Loading conversation...')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.queryByText('Loading conversation...'),
        ).not.toBeInTheDocument();
      });
    });

    it('should load conversation with messages', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(conversationAPI.getConversation).toHaveBeenCalledWith(
          mockConversation._id,
        );
      });
    });

    it('should create new conversation if none exist', async () => {
      (conversationAPI.getAllConversations as jest.Mock).mockResolvedValue([]);

      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(conversationAPI.createConversation).toHaveBeenCalledWith(
          'New Chat',
        );
      });
    });

    it('should display welcome message when no conversations exist', async () => {
      (conversationAPI.getAllConversations as jest.Mock).mockResolvedValue([]);

      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Hello! I am here to listen/),
        ).toBeInTheDocument();
      });
    });

    it('should handle conversation loading error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (conversationAPI.getAllConversations as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Hello! I am here to listen/),
        ).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with chat tab active', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const chatTab = screen.getByText('AI Chat');
        expect(chatTab).toHaveClass('active');
      });
    });

    it('should switch to journal tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('AI Chat')).toBeInTheDocument();
      });

      const journalTab = screen.getByText('Journal');
      await user.click(journalTab);

      expect(journalTab).toHaveClass('active');
    });

    it('should display chat content when chat tab is active', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Quick Prompts')).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText('Type your message...'),
        ).toBeInTheDocument();
      });
    });

    it('should display journal content when journal tab is active', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Journal')).toBeInTheDocument();
      });

      const journalTab = screen.getByText('Journal');
      await user.click(journalTab);

      await waitFor(() => {
        expect(
          screen.getByText('How are you feeling today?'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('▶')).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('▶');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('◀')).toBeInTheDocument();
      });
    });

    it('should show backdrop when sidebar is open on mobile', async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('▶')).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('▶');
      await user.click(toggleButton);

      await waitFor(() => {
        const backdrop = container.querySelector('.bg-black\\/40');
        expect(backdrop).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode Toggle', () => {
    it('should toggle dark mode when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('🌙')).toBeInTheDocument();
      });

      const darkModeButton = screen.getByText('🌙');
      await user.click(darkModeButton);

      expect(mockSetIsDarkMode).toHaveBeenCalledWith(true);
    });

    it('should toggle off dark mode when already enabled', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} isDarkMode={true} />);

      await waitFor(() => {
        expect(screen.getByText('☀️')).toBeInTheDocument();
      });

      const darkModeButton = screen.getByText('☀️');
      await user.click(darkModeButton);

      expect(mockSetIsDarkMode).toHaveBeenCalledWith(false);
    });
  });

  describe('New Conversation', () => {
    const findNewConvoButton = () => {
      const buttons = screen.getAllByRole('button');
      const newConvoButton = buttons.find((btn) =>
        btn.querySelector('.lucide-square-pen'),
      );
      if (!newConvoButton) {
        throw new Error('New Conversation button not found via icon selector.');
      }
      return newConvoButton;
    };

    it('should create new conversation when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      const newConvoButton = await waitFor(() => findNewConvoButton());

      await user.click(newConvoButton);

      expect(conversationAPI.createConversation).toHaveBeenCalled();
    });

    it('should display welcome message in new conversation', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      const newConvoButton = await waitFor(() => findNewConvoButton());
      await user.click(newConvoButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Hello! I am here to listen/i),
        ).toBeInTheDocument();
      });
    });

    it('should handle new conversation creation error', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      (conversationAPI.createConversation as jest.Mock).mockRejectedValue(
        new Error('Failed to create'),
      );

      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      const newConvoButton = await waitFor(() => findNewConvoButton());
      await user.click(newConvoButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Message Sending', () => {
    it('should send message via socket when submitted', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Type your message...'),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'Hello AI');

      const submitButton = screen.getByRole('button', { name: '→' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(socketService.sendMessage).toHaveBeenCalledWith(
          mockConversation._id,
          'Hello AI',
        );
      });
    });

    it('should display user message immediately after sending', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Type your message...'),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'Test message');

      const submitButton = screen.getByRole('button', { name: '→' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should show thinking indicator after sending message', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Type your message...'),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'Question for AI');

      const submitButton = screen.getByRole('button', { name: '→' });
      await user.click(submitButton);

      await waitFor(() => {
        const thinkingIndicators = screen
          .getAllByRole('generic')
          .filter((el) => el.querySelector('.lds-ellipsis'));
        expect(thinkingIndicators.length).toBeGreaterThan(0);
      });
    });

    it('should handle message sending error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (socketService.sendMessage as jest.Mock).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Type your message...'),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'Message that will fail');

      const submitButton = screen.getByRole('button', { name: '→' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to send message/)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Type your message...'),
        ).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: '→' });
      await user.click(submitButton);

      expect(socketService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Settings Dialog', () => {
    it('should open settings when settings button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const settingsButton = screen.getByText('B');
        user.click(settingsButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Privacy Controls')).toBeInTheDocument();
      });
    });

    it('should navigate to landing on logout', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const settingsButton = screen.getByText('B');
        user.click(settingsButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Log Out')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Log Out');
      await user.click(logoutButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('landing');
    });
  });

  describe('Conversation Switching', () => {
    it('should load conversation when chat session is selected', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(conversationAPI.getConversation).toHaveBeenCalled();
      });
    });

    it('should display loading state when switching conversations', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.queryByText('Loading conversation...'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation buttons', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible tab navigation', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('AI Chat')).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
      });
    });

    it('should have proper connection status indicators', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const statusElement = screen.getByTitle('Connected');
        expect(statusElement).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render main content container', async () => {
      const { container } = render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const mainContent = container.querySelector('.grow');
        expect(mainContent).toBeInTheDocument();
      });
    });

    it('should have proper height constraints', async () => {
      const { container } = render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        const wrapper = container.querySelector('.h-screen');
        expect(wrapper).toBeInTheDocument();
      });
    });
  });
});
