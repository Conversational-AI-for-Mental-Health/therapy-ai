const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
import { AuthData, AuthResponse } from "./types";
class AuthAPI {
  private persistAuthData(data?: AuthData) {
    if (!data) return;
    const token = data.token || data.accessToken;
    if (token) {
      localStorage.setItem('token', token);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  storeAuthData(data?: AuthData) {
    this.persistAuthData(data);
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (data?.success) this.persistAuthData(data.data);
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data?.success) this.persistAuthData(data.data);
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Forgot password failed',
      };
    }
  }

  async resetPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Reset password failed',
      };
    }
  }
  //google or apple login
  async socialLogin(
    provider: 'google' | 'apple',
    profile: any,
    idToken: string,
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, profile, idToken }),
      });

      const data = await response.json();
      if (data?.success) this.persistAuthData(data.data);
      return data;
    } catch (error: any) {
      console.error('Social login error:', error);
      return {
        success: false,
        error: error.message || 'Social login failed',
      };
    }
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const user = this.getCurrentUser();
      if (!refreshToken || !user?._id) {
        return {
          success: false,
          error: 'Missing refresh session',
        };
      }

      const response = await fetch(`${API_URL}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          refreshToken,
        }),
      });

      const data = await response.json();
      if (data?.success) {
        this.persistAuthData({
          ...data.data,
          user: user,
        });
      }
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to refresh token',
      };
    }
  }

  private async revokeSessionOnServer() {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();
      if (!token) return;

      await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.warn('Logout API call failed, clearing local session.');
    }
  }

  logout() {
    void this.revokeSessionOnServer();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthAPI();