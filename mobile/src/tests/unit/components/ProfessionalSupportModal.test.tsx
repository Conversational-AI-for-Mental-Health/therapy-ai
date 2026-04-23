/// <reference types="jest" />
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import ProfessionalSupportModal from '../../../components/ProfessionalSupportModal';

jest.mock('../../../config/env', () => ({
  getApiBaseUrl: () => 'http://localhost',
}));

describe('ProfessionalSupportModal Component', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
  });

  it('renders input elements properly', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<ProfessionalSupportModal {...defaultProps} />);

    expect(getByText('Contact Professional Support')).toBeTruthy();
    expect(getByPlaceholderText('+1 (555) 123-4567')).toBeTruthy();
    expect(getByText('Skip')).toBeTruthy();
    expect(getByText('Send Request')).toBeTruthy();
  });

  it('handles sending request with phone', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, message: 'Notified' })
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(<ProfessionalSupportModal {...defaultProps} />);

    const input = getByPlaceholderText('+1 (555) 123-4567');
    fireEvent.changeText(input, '1234567890');

    const sendBtn = getByText('Send Request');
    fireEvent.press(sendBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/emergency/request-support'),
        expect.objectContaining({
          body: expect.stringContaining('1234567890')
        })
      );
      expect(getByText('Notified')).toBeTruthy();
    });
  });

  it('handles skip functionality without phone', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, message: 'Notified' })
    });

    const { getByText } = renderWithProviders(<ProfessionalSupportModal {...defaultProps} />);

    const skipBtn = getByText('Skip');
    fireEvent.press(skipBtn);

    await waitFor(() => {

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(JSON.parse(callArgs.body).userPhone).toBeUndefined();
    });
  });

  it('shows error message if API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, message: 'Server failed' })
    });

    const { getByText } = renderWithProviders(<ProfessionalSupportModal {...defaultProps} />);

    const skipBtn = getByText('Skip');
    fireEvent.press(skipBtn);

    await waitFor(() => {
      expect(getByText('Server failed')).toBeTruthy();
    });
  });
});
