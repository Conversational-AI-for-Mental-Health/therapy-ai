import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import authAPI from '@/util/authAPI';

jest.mock('@/util/authAPI', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    forgotPassword: jest.fn(),
    socialLogin: jest.fn(),
    storeAuthData: jest.fn(),
  },
}));

describe('LoginPage', () => {
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authAPI.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Test User', email: 'test@example.com' },
      },
    });
    (authAPI.forgotPassword as jest.Mock).mockResolvedValue({ success: true });
    (authAPI.socialLogin as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Test User', email: 'test@example.com' },
      },
    });
  });

  describe('Rendering', () => {
    it('should render login page with all elements', () => {
      render(<LoginPage {...defaultProps} />);

      expect(screen.getByText('Welcome Back👋')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your journey')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
    });

    it('should render Therapy AI logo', () => {
      render(<LoginPage {...defaultProps} />);

      expect(screen.getByAltText('Therapy AI')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<LoginPage {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'login-email');
    });

    it('should render password input field', () => {
      render(<LoginPage {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'login-password');
    });

    it('should render social login buttons', () => {
      render(<LoginPage {...defaultProps} />);

      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
    });

    it('should render or divider', () => {
      render(<LoginPage {...defaultProps} />);

      expect(screen.getByText('or')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<LoginPage {...defaultProps} />);

      expect(screen.getByText(/No account\?/)).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard when login button is clicked with valid inputs', async () => {
      const user = userEvent.setup();
      render(<LoginPage {...defaultProps} />);

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      await user.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
      });
    });

    it('should show error and not navigate when fields are empty', async () => {
      const user = userEvent.setup();
      render(<LoginPage {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Log In' }));

      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      expect(mockOnNavigate).not.toHaveBeenCalled();
    });

    it('should navigate to signup when sign up link is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginPage {...defaultProps} />);

      await user.click(screen.getByText('Sign up'));

      expect(mockOnNavigate).toHaveBeenCalledWith('signup');
    });

    it('should navigate to landing when home link is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginPage {...defaultProps} />);

      await user.click(screen.getByText('Home'));

      expect(mockOnNavigate).toHaveBeenCalledWith('landing');
    });
  });

  describe('Form Inputs', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(<LoginPage {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      render(<LoginPage {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Styling', () => {
    it('should apply gradient primary styling to login button', () => {
      render(<LoginPage {...defaultProps} />);

      const loginButton = screen.getByRole('button', { name: 'Log In' });
      expect(loginButton).toHaveClass('gradient-bg-primary', 'text-white');
    });

    it('should apply correct styling to form container heading', () => {
      render(<LoginPage {...defaultProps} />);

      const heading = screen.getByText('Welcome Back👋');
      expect(heading).toHaveClass('text-h1', 'text-center');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<LoginPage {...defaultProps} />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<LoginPage {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Social Login Buttons', () => {
    it('should render Google login button with icon', () => {
      render(<LoginPage {...defaultProps} />);

      const googleButton = screen.getByText('Continue with Google').closest('button');
      expect(googleButton).toBeInTheDocument();
      expect(googleButton?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Apple login button with icon', () => {
      render(<LoginPage {...defaultProps} />);

      const appleButton = screen.getByText('Continue with Apple').closest('button');
      expect(appleButton).toBeInTheDocument();
      expect(appleButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should center the login form on the page', () => {
      const { container } = render(<LoginPage {...defaultProps} />);

      expect(container.firstChild).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
    });

    it('should have responsive padding', () => {
      const { container } = render(<LoginPage {...defaultProps} />);

      expect(container.firstChild).toHaveClass('px-4', 'sm:px-6', 'md:px-8');
    });

    it('should have constrained max width', () => {
      const { container } = render(<LoginPage {...defaultProps} />);

      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });
  });
});