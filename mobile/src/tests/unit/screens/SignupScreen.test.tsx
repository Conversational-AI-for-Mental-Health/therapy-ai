/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import SignupScreen from '../../../screens/SignupScreen';
import { useAuth } from '../../../context/AuthContext';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

describe('SignupScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
  };

  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    });
  });

  it('renders all fields properly', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <SignupScreen navigation={mockNavigation as any} />
    );

    expect(getByText('Create Account ✨')).toBeTruthy();
    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password (min. 8 characters)')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('validates empty fields', () => {
    const { getByText } = renderWithProviders(
      <SignupScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('Create Account'));
    expect(getByText('Please fill in all fields')).toBeTruthy();
  });

  it('validates password length minimum', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <SignupScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password (min. 8 characters)'), 'short');
    fireEvent.press(getByText('Create Account'));

    expect(getByText('Password must be at least 8 characters')).toBeTruthy();
  });

  it('calls register and proceeds to dashboard on success', async () => {
    mockRegister.mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <SignupScreen navigation={mockNavigation as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password (min. 8 characters)'), 'longpassword');
    fireEvent.press(getByText('Create Account'));

    expect(mockRegister).toHaveBeenCalledWith('John', 'test@test.com', 'longpassword');

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('navigates to Login on footer link press', () => {
    const { getByText } = renderWithProviders(
      <SignupScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('Login'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});
