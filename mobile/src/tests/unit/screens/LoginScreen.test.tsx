/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import LoginScreen from '../../../screens/LoginScreen';
import { useAuth } from '../../../context/AuthContext';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('LoginScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
  };

  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('renders properly', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation as any} />
    );

    expect(getByText('Welcome Back 👋')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('shows error if fields are empty', () => {
    const { getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('Login'));
    expect(getByText('Please fill in all fields')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login properly and navigates on success', async () => {
    mockLogin.mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('shows error message on failure', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'badpass');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });
  });

  it('navigates to Signup when footer link is pressed', () => {
    const { getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('Sign up'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
  });
});
