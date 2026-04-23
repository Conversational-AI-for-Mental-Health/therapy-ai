/// <reference types="jest" />
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../../context/AuthContext';

interface RenderOptions {
  withAuth?: boolean;
  withNavigation?: boolean;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  { withAuth = true, withNavigation = true }: RenderOptions = {}
) => {
  let Wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  if (withAuth) {
    const Inner = Wrapper;
    Wrapper = ({ children }) => (
      <AuthProvider>
        <Inner>{children}</Inner>
      </AuthProvider>
    );
  }

  if (withNavigation) {
    const Inner = Wrapper;
    Wrapper = ({ children }) => (
      <NavigationContainer>
        <Inner>{children}</Inner>
      </NavigationContainer>
    );
  }

  return render(ui, { wrapper: Wrapper });
};
