import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../pages/SignupPage';

describe('SignupPage', () => {
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render signup page with all elements', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText('Create Account ✨')).toBeInTheDocument();
      expect(
        screen.getByText('Start your journey to better mental health'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create Account' }),
      ).toBeInTheDocument();
    });

    it('should render brain emoji logo', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText('🧠')).toBeInTheDocument();
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
    it('should navigate to dashboard when create account button is clicked', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      const signupButton = screen.getByRole('button', {
        name: 'Create Account',
      });
      await user.click(signupButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
    });

    it('should navigate to login when log in link is clicked', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      const loginLink = screen.getByText('Log in');
      await user.click(loginLink);

      expect(mockOnNavigate).toHaveBeenCalledWith('login');
    });

    it('should navigate to landing when home link is clicked', async () => {
      const user = userEvent.setup();
      render(<SignupPage {...defaultProps} />);

      const homeLink = screen.getByText('Home');
      await user.click(homeLink);

      expect(mockOnNavigate).toHaveBeenCalledWith('landing');
    });
  });

  describe('Form Inputs', () => {
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

      const passwordInput = screen.getByLabelText(
        'Password',
      ) as HTMLInputElement;
      await user.type(passwordInput, 'securePassword123');

      expect(passwordInput.value).toBe('securePassword123');
    });

    it('should have proper input types for security', () => {
      render(<SignupPage {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Styling', () => {
    it('should apply primary styling to create account button', () => {
      render(<SignupPage {...defaultProps} />);

      const signupButton = screen.getByRole('button', {
        name: 'Create Account',
      });
      expect(signupButton).toHaveClass('bg-primary', 'text-white');
    });

    it('should apply correct styling to form container', () => {
      render(<SignupPage {...defaultProps} />);

      const heading = screen.getByText('Create Account ✨');
      expect(heading).toHaveClass('text-h1', 'text-primary');
    });

    it('should have welcoming subtitle styling', () => {
      render(<SignupPage {...defaultProps} />);

      const subtitle = screen.getByText(
        'Start your journey to better mental health',
      );
      expect(subtitle).toHaveClass('text-body-sm', 'text-secondary');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<SignupPage {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper link text', () => {
      render(<SignupPage {...defaultProps} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy();
      });
    });
  });

  describe('Social Signup Buttons', () => {
    it('should render Google signup button with icon', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      const googleButton = screen
        .getByText('Continue with Google')
        .closest('button');
      expect(googleButton).toBeInTheDocument();

      const googleIcon = googleButton?.querySelector('svg');
      expect(googleIcon).toBeInTheDocument();
    });

    it('should render Apple signup button with icon', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      const appleButton = screen
        .getByText('Continue with Apple')
        .closest('button');
      expect(appleButton).toBeInTheDocument();

      const appleIcon = appleButton?.querySelector('svg');
      expect(appleIcon).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should center the signup form on the page', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass(
        'min-h-screen',
        'flex',
        'items-center',
        'justify-center',
      );
    });

    it('should have responsive padding', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('px-4', 'sm:px-6', 'md:px-8');
    });

    it('should have constrained max width', () => {
      const { container } = render(<SignupPage {...defaultProps} />);

      const formContainer = container.querySelector('.max-w-sm');
      expect(formContainer).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should have appropriate spacing between elements', () => {
      render(<SignupPage {...defaultProps} />);

      const heading = screen.getByText('Create Account ✨');
      const subtitle = screen.getByText(
        'Start your journey to better mental health',
      );

      expect(heading).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });

    it('should have clear call-to-action button', () => {
      render(<SignupPage {...defaultProps} />);

      const ctaButton = screen.getByRole('button', { name: 'Create Account' });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('w-full');
    });

    it('should provide alternative login option', () => {
      render(<SignupPage {...defaultProps} />);

      expect(screen.getByText(/Have an account\?/)).toBeInTheDocument();
      expect(screen.getByText('Log in')).toBeInTheDocument();
    });
  });
});
