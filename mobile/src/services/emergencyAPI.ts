import * as SecureStore from 'expo-secure-store';
import authAPI from './authAPI';
import { EmergencyRequestParams, EmergencyResponse } from '../types';
import { API_URL } from '../constants/constants';

class EmergencyAPI {
  private async fetchWithAuthRetry(endpoint: string, options: RequestInit): Promise<Response> {
    const requestOnce = async () => {
      const token = await SecureStore.getItemAsync('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(`${API_URL}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers as any) } });
    };

    let response = await requestOnce();
    if (response.status === 401 && (await authAPI.getRefreshToken())) {
      const refreshed = await authAPI.refreshAccessToken();
      if (refreshed.success) response = await requestOnce();
    }
    return response;
  }

  async requestProfessionalSupport(params: EmergencyRequestParams): Promise<EmergencyResponse> {
    try {
      const response = await this.fetchWithAuthRetry('/emergency/request-support', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error: any) {
      throw error;
    }
  }
}

export default new EmergencyAPI();
