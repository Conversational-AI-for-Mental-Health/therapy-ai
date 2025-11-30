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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render settings dialog when isOpen is true', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Jamie R.')).toBeInTheDocument();
      expect(screen.getByText('jamie.r@example.com')).toBeInTheDocument();
      expect(screen.getByText('Privacy Controls')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<Settings {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Jamie R.')).not.toBeInTheDocument();
    });

    it('should render all privacy control toggles', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Analytics Tracking')).toBeInTheDocument();
      expect(screen.getByText('Personalized Ads')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('should render data management section', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Data Management')).toBeInTheDocument();
      expect(screen.getByText('Delete All Chats')).toBeInTheDocument();
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    it('should render logout button', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<Settings {...defaultProps} />);

      const closeButtons = screen
        .getAllByRole('button')
        .filter((button) => button.querySelector('svg'));
      expect(closeButtons.length).toBeGreaterThan(0);
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

    it('should toggle push notifications when clicked', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const notificationsToggle = screen
        .getByText('Push Notifications')
        .closest('div')
        ?.querySelector('button');

      if (notificationsToggle) {
        await user.click(notificationsToggle);
        expect(mockSetPushNotifications).toHaveBeenCalledWith(false);
      }
    });

    it('should reflect current toggle states visually', () => {
      render(<Settings {...defaultProps} />);

      const analyticsToggle = screen
        .getByText('Analytics Tracking')
        .closest('div')
        ?.querySelector('button');
      expect(analyticsToggle).toHaveClass('bg-primary');

      const adsToggle = screen
        .getByText('Personalized Ads')
        .closest('div')
        ?.querySelector('button');
      expect(adsToggle).toHaveClass('bg-gray-300');

      const notificationsToggle = screen
        .getByText('Push Notifications')
        .closest('div')
        ?.querySelector('button');
      expect(notificationsToggle).toHaveClass('bg-primary');
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

    it('should call onClose when clicking outside the dialog', async () => {
      const user = userEvent.setup();
      const { container } = render(<Settings {...defaultProps} />);

      const backdrop = container.querySelector('div[style*="backdrop"]');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when clicking inside the dialog', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const dialog = screen.getByText('Jamie R.').closest('div');
      if (dialog) {
        await user.click(dialog);
        expect(mockOnClose).not.toHaveBeenCalled();
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
    it('should display user avatar with initial', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should display user name', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('Jamie R.')).toBeInTheDocument();
    });

    it('should display user email', () => {
      render(<Settings {...defaultProps} />);

      expect(screen.getByText('jamie.r@example.com')).toBeInTheDocument();
    });

    it('should render edit button for profile', () => {
      render(<Settings {...defaultProps} />);

      const editButtons = screen
        .getAllByRole('button')
        .filter((button) => button.querySelector('svg[class*="lucide"]'));
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<Settings {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5);
    });

    it('should stop event propagation when clicking inside dialog', async () => {
      const user = userEvent.setup();
      render(<Settings {...defaultProps} />);

      const privacyHeading = screen.getByText('Privacy Controls');
      await user.click(privacyHeading);

      expect(mockOnClose).not.toHaveBeenCalled();
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
