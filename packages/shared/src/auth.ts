export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

export interface AuthSuccessResponse {
  success: true;
  data: {
    user: AuthUser;
    token: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresIn?: string;
    refreshTokenExpiresAt?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type AuthResponse = AuthSuccessResponse | ApiErrorResponse;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
}
