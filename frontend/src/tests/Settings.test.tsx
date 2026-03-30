import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../components/layout/Settings';

describe('Settings Component', () => {
  const mockOnClose = jest.fn();
  const mockOnLogout = jest.fn();
  const mockSetAnalyticsTracking = jest.fn();
  const mockSetPersonalizedAds = jest.fn();
  const mockSetPushNotifications = jest.fn();
  const mockSetUser = jest.fn();

  const mockUser = {
    name: 'Test User',
    email: 'test@example.com'
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onLogout: mockOnLogout,
    analyticsTracking: true,
    setAnalyticsTracking: mockSetAnalyticsTracking,
    personalizedAds: false,
    setPersonalizedAds: mockSetPersonalizedAds,
    pushNotifications: true,
    setPushNotifications: mockSetPushNotifications,
    user: mockUser,
    setUser: mockSetUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render settings dialog when isOpen is true', () => {
      render(<Settings {...defaultProps} />);

      // The header shows the first name only
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<Settings {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    it('should render all privacy toggles', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Analytics Tracking')).toBeInTheDocument();
      expect(screen.getByText('Personalized Ads')).toBeInTheDocument();
    });

    it('should render notification toggles', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('should render account section with name and password change', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('should render delete account button', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    it('should render logout button', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
  });

  describe('Toggle Controls', () => {
    it('should toggle analytics tracking when clicked', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const analyticsToggle = screen
        .getByText('Analytics Tracking')
        .closest('div')
        ?.querySelector('button');

      if (analyticsToggle) {
        await user.click(analyticsToggle);
        expect(mockSetAnalyticsTracking).toHaveBeenCalledWith(false);
      }
    });

    it('should toggle personalized ads when clicked', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const adsToggle = screen
        .getByText('Personalized Ads')
        .closest('div')
        ?.querySelector('button');

      if (adsToggle) {
        await user.click(adsToggle);
        expect(mockSetPersonalizedAds).toHaveBeenCalledWith(true);
      }
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const closeButton = screen
        .getAllByRole('button')
        .find((button) => button.querySelector('svg'));

      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onClose when clicking background backdrop', async () => {
      const user = userEvent.setup();
      const { container } = render(<Settings {...defaultProps} />);

      const backdrop = container.firstElementChild;
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Logout Functionality', () => {
    it('should call onLogout when logout button is clicked', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const logoutButton = screen.getByText('Log Out');
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Profile Section', () => {
    it('should display user name (first name) and email', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply primary styling to logout button', () => {
      render(<Settings {...defaultProps} />);

      const logoutButton = screen.getByText('Log Out');
      expect(logoutButton).toHaveClass('bg-primary', 'text-white');
    });
  });
});
