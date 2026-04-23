import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../pages/SignupPage';
import authAPI from '@/util/authAPI';

jest.mock('@/util/authAPI', () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    socialLogin: jest.fn(),
    storeAuthData: jest.fn(),
  },
}));

describe('SignupPage', () => {
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authAPI.register as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Test User', email: 'test@example.com' },
      },
    });
    (authAPI.socialLogin as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Test User', email: 'test@example.com' },
      },
    });
  });

  describe('Rendering', () => {
    it('should render signup page with all elements', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByAltText('Therapy AI')).toBeInTheDocument();
      expect(screen.getByText('Create Account ✨')).toBeInTheDocument();
      expect(screen.getByText('Start your journey to better mental health')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<SignupPage {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'signup-email');
    });

    it('should render password input field', () => {
      render(<SignupPage {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'signup-password');
    });

    it('should render social signup buttons', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
    });

    it('should render or divider', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText('or')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText(/Have an account\?/)).toBeInTheDocument();
      expect(screen.getByText('Log in')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard when create account button is clicked with valid inputs', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      await user.type(screen.getByLabelText('Full Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
        expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
      });
    });

    it('should show error and not navigate when fields are empty', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      expect(mockOnNavigate).not.toHaveBeenCalled();
    });

    it('should navigate to login when log in link is clicked', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      await user.click(screen.getByText('Log in'));
      expect(mockOnNavigate).toHaveBeenCalledWith('login');
    });

    it('should navigate to landing when home link is clicked', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      await user.click(screen.getByText('Home'));
      expect(mockOnNavigate).toHaveBeenCalledWith('landing');
    });
  });

  describe('Form Inputs', () => {
    it('should allow typing in name field', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
      await user.type(nameInput, 'New User');

      expect(nameInput.value).toBe('New User');
    });

    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      await user.type(emailInput, 'newuser@example.com');

      expect(emailInput.value).toBe('newuser@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      await user.type(passwordInput, 'securePassword123');

      expect(passwordInput.value).toBe('securePassword123');
    });
  });

  describe('Styling', () => {
    it('should apply gradient primary styling to create account button', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Create Account' })).toHaveClass('gradient-bg-primary', 'text-white');
    });

    it('should apply correct styling to form container heading', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText('Create Account ✨')).toHaveClass('text-h2', 'text-center');
    });

    it('should have welcoming subtitle styling', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText('Start your journey to better mental health')).toHaveClass('text-body-sm', 'text-secondary');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });

  describe('Social Signup Buttons', () => {
    it('should render Google signup button with icon', () => {
      render(<SignupPage {...defaultProps} />);

      const googleButton = screen.getByText('Continue with Google').closest('button');
      expect(googleButton).toBeInTheDocument();
      expect(googleButton?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Apple signup button with icon', () => {
      render(<SignupPage {...defaultProps} />);

      const appleButton = screen.getByText('Continue with Apple').closest('button');
      expect(appleButton).toBeInTheDocument();
      expect(appleButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should center the signup form on the page', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      expect(container.firstChild).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
    });

    it('should have responsive padding', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      expect(container.firstChild).toHaveClass('px-4', 'sm:px-6', 'md:px-8');
    });

    it('should have constrained max width', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });
  });
});