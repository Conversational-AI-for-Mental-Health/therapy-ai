import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../pages/Dashboard';
import socketService from '@/util/socketService';
import conversationAPI from '@/util/conversationAPI';
import authAPI from '@/util/authAPI';
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
    getSocket: jest.fn(() => ({ on: jest.fn(), off: jest.fn() })),
    setActiveConversation: jest.fn(),
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
    isAuthenticated: jest.fn(() => true),
    getCurrentUser: jest.fn(() => ({ name: 'Test User', email: 'test@example.com' })),
    logout: jest.fn(),
  },
}));

jest.mock('@/util/emergencyAPI', () => ({
  __esModule: true,
  default: {
    requestProfessionalSupport: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

jest.mock('rehype-sanitize', () => () => { });

describe('DashboardPage', () => {
  const mockOnNavigate = jest.fn();
  const mockSetIsDarkMode = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
    isDarkMode: false,
    setIsDarkMode: mockSetIsDarkMode,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply implementations that clearAllMocks() wipes out
    (authAPI.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authAPI.getCurrentUser as jest.Mock).mockReturnValue({ name: 'Test User', email: 'test@example.com' });
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    (socketService.getSocket as jest.Mock).mockReturnValue({ on: jest.fn(), off: jest.fn() });
    (conversationAPI.getAllConversations as jest.Mock).mockResolvedValue(mockConversations);
    (conversationAPI.getConversation as jest.Mock).mockResolvedValue(mockConversation);
    (conversationAPI.createConversation as jest.Mock).mockResolvedValue(mockConversation);
  });

  it('loads initial data and renders tabs', async () => {
    render(<DashboardPage {...defaultProps} />);

    await waitFor(() => {
      expect(conversationAPI.getAllConversations).toHaveBeenCalled();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Journal')).toBeInTheDocument();
    });
  });

  it('connects socket on mount and disconnects on unmount', async () => {
    const { unmount } = render(<DashboardPage {...defaultProps} />);

    await waitFor(() => {
      expect(socketService.connect).toHaveBeenCalled();
    });

    unmount();
    expect(socketService.disconnect).toHaveBeenCalled();
  });

  describe('Rendering', () => {
    it('should render dashboard with all core elements', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByAltText('Therapy AI')).toBeInTheDocument();
        expect(screen.getByText('Chat')).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
      });
    });

    it('should render sidebar toggle button', async () => {
      const { container } = render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('[data-cy="sidebar-toggle"]')).toBeInTheDocument();
      });
    });

    it('should render dark mode toggle', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('🌙')).toBeInTheDocument();
      });
    });

    it('should render connection status indicator', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTitle('Connected')).toBeInTheDocument();
      });
    });

    it('should show connecting status when socket is disconnected', async () => {
      (socketService.isConnected as jest.Mock).mockReturnValue(false);

      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTitle('Connecting...')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should start with chat tab active', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Chat')).toHaveClass('active');
      });
    });

    it('should switch to journal tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Chat')).toBeInTheDocument();
      });

      const journalTab = screen.getByText('Journal');
      await user.click(journalTab);

      expect(journalTab).toHaveClass('active');
    });

    it('should display chat content when chat tab is active', async () => {
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
      });
    });

    it('should display journal content when journal tab is active', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Chat')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Journal'));

      await waitFor(() => {
        expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar when toggle button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('[data-cy="sidebar-toggle"]')).toBeInTheDocument();
      });

      const toggleButton = container.querySelector('[data-cy="sidebar-toggle"]');
      if (toggleButton) await user.click(toggleButton);

      await waitFor(() => {
        const sidebar = container.querySelector('[data-cy="sidebar"]');
        expect(sidebar).toHaveClass('translate-x-0');
      });
    });
  });

  describe('Dark Mode Toggle', () => {
    it('should toggle dark mode when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      const darkModeButton = await waitFor(() => screen.getByText('🌙'));
      await user.click(darkModeButton);

      expect(mockSetIsDarkMode).toHaveBeenCalledWith(true);
    });
  });

  describe('New Conversation', () => {
    it('should navigate to fresh conversation state when new chat button clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardPage {...defaultProps} />);

      const toggleButton = await waitFor(() => container.querySelector('[data-cy="sidebar-toggle"]'));
      if (toggleButton) await user.click(toggleButton);

      const newConvoButton = await waitFor(() => container.querySelector('[data-cy="new-chat-btn"]'));
      if (newConvoButton) await user.click(newConvoButton);

      await waitFor(() => {
        expect(screen.getByText(/Hello! I am here to listen/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Sending', () => {
    it('should send message via socket when submitted', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type your message...');
      await user.type(input, 'Hello AI{enter}');

      await waitFor(() => {
        expect(socketService.sendMessage).toHaveBeenCalled();
      });
    });

    it('should display user message immediately after sending', async () => {
      const user = userEvent.setup();
      render(<DashboardPage {...defaultProps} />);

      const input = await waitFor(() => screen.getByPlaceholderText('Type your message...'));
      await user.type(input, 'Test message{enter}');

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should show thinking indicator after sending message', async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardPage {...defaultProps} />);

      const input = await waitFor(() => screen.getByPlaceholderText('Type your message...'));
      await user.type(input, 'Question for AI{enter}');

      await waitFor(() => {
        expect(container.querySelector('[data-cy="thinking-bubble"]')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Dialog', () => {
    it('should open settings when user initial is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardPage {...defaultProps} />);

      const settingsButton = await waitFor(() => container.querySelector('[data-cy="settings-btn"]'));
      if (settingsButton) await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('Account')).toBeInTheDocument();
      });
    });
  });
});