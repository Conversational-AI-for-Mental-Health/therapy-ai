const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface EmergencyRequestParams {
  userPhone?: string;
  reason?: string;
}

interface EmergencyResponse {
  success: boolean;
  message: string;
  data?: {
    notified: boolean;
    timestamp: string;
  };
}

class EmergencyAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

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
