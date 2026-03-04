import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../pages/SignupPage';
import authAPI from '@/util/authAPI';

jest.mock('@/util/authAPI', () => ({
  __esModule: true,
  default: {
    register: jest.fn().mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Jamie', email: 'jamie.r@example.com' },
      },
    }),
    socialLogin: jest.fn().mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Jamie', email: 'jamie.r@example.com' },
      },
    }),
    storeAuthData: jest.fn(),
  },
}));

describe('SignupPage', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authAPI.register as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Jamie', email: 'jamie.r@example.com' },
      },
    });
    (authAPI.socialLogin as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'mock-token',
        user: { name: 'Jamie', email: 'jamie.r@example.com' },
      },
    });
  });

  it('renders key signup fields and actions', () => {
    render(<SignupPage onNavigate={mockOnNavigate} />);

    expect(screen.getByAltText('Therapy AI')).toBeInTheDocument();
    expect(screen.getByText('Create Account ✨')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('submits registration and navigates to dashboard', async () => {
    const user = userEvent.setup();
    render(<SignupPage onNavigate={mockOnNavigate} />);

    await user.type(screen.getByLabelText('Full Name'), 'Jamie Reed');
    await user.type(screen.getByLabelText('Email'), 'jamie@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(authAPI.register).toHaveBeenCalledWith(
      'Jamie Reed',
      'jamie@example.com',
      'password123',
    );
    await waitFor(() => {
      expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
    });
  });

  it('navigates with footer links', async () => {
    const user = userEvent.setup();
    render(<SignupPage onNavigate={mockOnNavigate} />);

    await user.click(screen.getByText('Log in'));
    expect(mockOnNavigate).toHaveBeenCalledWith('login');

    await user.click(screen.getByText('Home'));
    expect(mockOnNavigate).toHaveBeenCalledWith('landing');
  });
});
