/// <reference types="jest" />
import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import SettingsModal from '../../../components/SettingsModal';

describe('SettingsModal Component', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onLogout: jest.fn(),
    user: { name: 'Test User', email: 'test@t.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation((_, __, buttons: any) => {

      const targetBtn = buttons.find((b: any) => b.style === 'destructive');
      if (targetBtn && targetBtn.onPress) targetBtn.onPress();
    });
  });

  it('renders profile correctly', () => {
    const { getByText } = renderWithProviders(<SettingsModal {...defaultProps} />);
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@t.com')).toBeTruthy();
    expect(getByText('T')).toBeTruthy();
  });

  it('handles logout flow via alert', () => {
    const { getByText } = renderWithProviders(<SettingsModal {...defaultProps} />);

    const logoutBtn = getByText('Log Out');
    fireEvent.press(logoutBtn);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Log Out',
      'Are you sure you want to log out?',
      expect.any(Array)
    );
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('renders toggles', () => {
    const { getByText } = renderWithProviders(<SettingsModal {...defaultProps} />);

    expect(getByText('Analytics Tracking')).toBeTruthy();
    expect(getByText('Personalized Ads')).toBeTruthy();
    expect(getByText('Push Notifications')).toBeTruthy();
  });
});
