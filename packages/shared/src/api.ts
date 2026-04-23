export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  count?: number;
}

export interface ApiFailureResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;
