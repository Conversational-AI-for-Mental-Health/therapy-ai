/// <reference types="jest" />
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AppNavigator from '../../../navigation/AppNavigator';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../screens/LoginScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>LoginScreenMock</Text>;
});
jest.mock('../../../screens/SignupScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>SignupScreenMock</Text>;
});
jest.mock('../../../screens/DashboardScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>DashboardScreenMock</Text>;
});

describe('AppNavigator', () => {
  const { useAuth } = require('../../../context/AuthContext');

  it('renders a loading indicator when auth is loading', () => {
    useAuth.mockReturnValue({ isLoading: true, isLoggedIn: false });

    const { getByTestId, UNSAFE_getByType } = render(<AppNavigator />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders Login screen when not logged in', async () => {
    useAuth.mockReturnValue({ isLoading: false, isLoggedIn: false });

    const { getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByText('LoginScreenMock')).toBeTruthy();
    });
  });

  it('renders Dashboard screen when logged in', async () => {
    useAuth.mockReturnValue({ isLoading: false, isLoggedIn: true });

    const { getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByText('DashboardScreenMock')).toBeTruthy();
    });
  });
});
