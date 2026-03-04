import authAPI from './authAPI';
import { EmergencyRequestParams, EmergencyResponse } from './types';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class EmergencyAPI {
  private async fetchWithAuthRetry(
    endpoint: string,
    options: RequestInit,
  ): Promise<Response> {
    const requestOnce = async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
    };

    let response = await requestOnce();
    if (response.status === 401 && authAPI.getRefreshToken()) {
      const refreshed = await authAPI.refreshAccessToken();
      if (refreshed.success) {
        response = await requestOnce();
      }
    }
    return response;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await this.fetchWithAuthRetry(endpoint, options);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('Emergency API Error:', error);
      throw error;
    }
  }

  async requestProfessionalSupport(
    params: EmergencyRequestParams
  ): Promise<EmergencyResponse> {
    return this.request<EmergencyResponse>('/emergency/request-support', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export default new EmergencyAPI();
