import AuthAPI from "../util/authAPI";

global.fetch = jest.fn();

describe("Authentication API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("should login successfully with valid credentials", async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: "1", email: "test@example.com" },
        token: "mockToken123",
      },
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.login("test@example.com", "Password123");

    expect(response.success).toBe(true);
    expect(response.data?.token).toBe("mockToken123");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("should fail login with invalid password", async () => {
    const mockResponse = {
      success: false,
      error: "Invalid credentials",
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.login("test@example.com", "wrongpass");

    expect(response.success).toBe(false);
    expect(response.error).toBe("Invalid credentials");
  });

  test("should handle network error during login", async () => {
    const mockFetch: any = global.fetch;
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const response = await AuthAPI.login("test@example.com", "Password123");

    expect(response.success).toBe(false);
    expect(response.error).toBe("Network error");
  });

  test("should register a user successfully", async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: "1", email: "test@example.com" },
        token: "mockToken123",
      },
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.register("Test User", "test@example.com", "password");

    expect(response.success).toBe(true);
    expect(response.data?.user.email).toBe("test@example.com");
  });

  test("should return error on registration failure", async () => {
    const mockResponse = {
      success: false,
      error: "Email already exists",
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.register("Test", "test@example.com", "password");

    expect(response.success).toBe(false);
    expect(response.error).toBe("Email already exists");
  });

  test("should perform social login successfully", async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: "77", email: "google@test.com" },
        token: "socialToken123",
      },
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const profile = { id: "social-id-1", email: "google@test.com", name: "Google User" };
    const idToken = "mock-google-id-token";

    const response = await AuthAPI.socialLogin("google", profile, idToken);

    expect(response.success).toBe(true);
    expect(response.data?.token).toBe("socialToken123");
  });

  test("should fail social login on server error", async () => {
    const mockResponse = {
      success: false,
      error: "Social login failed",
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.socialLogin("apple", {}, "mock-apple-id-token");

    expect(response.success).toBe(false);
    expect(response.error).toBe("Social login failed");
  });

  test("should request forgot password successfully", async () => {
    const mockResponse = {
      success: true,
      message: "Email verified. Continue to reset password.",
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.forgotPassword("test@example.com");

    expect(response.success).toBe(true);
    expect(response.message).toContain("Continue to reset password");
  });

  test("should reset password successfully", async () => {
    const mockResponse = {
      success: true,
      message: "Password reset successful",
    };

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const response = await AuthAPI.resetPassword("test@example.com", "NewPassword123");

    expect(response.success).toBe(true);
    expect(response.message).toBe("Password reset successful");
  });

  test("should store and retrieve auth token", () => {
    localStorage.setItem("token", "abcd1234");

    expect(AuthAPI.getToken()).toBe("abcd1234");
  });

  test("should store and retrieve refresh token", () => {
    localStorage.setItem("refreshToken", "refresh-1234");
    expect(AuthAPI.getRefreshToken()).toBe("refresh-1234");
  });

  test("should store and retrieve current user", () => {
    const user = { id: "1", email: "test@example.com" };
    localStorage.setItem("user", JSON.stringify(user));

    expect(AuthAPI.getCurrentUser()).toEqual(user);
  });

  test("should return null when user is not stored", () => {
    expect(AuthAPI.getCurrentUser()).toBe(null);
  });

  test("should logout user", () => {
    localStorage.setItem("token", "abc");
    localStorage.setItem("refreshToken", "refresh-abc");
    localStorage.setItem("user", "{}");

    AuthAPI.logout();

    expect(AuthAPI.getToken()).toBe(null);
    expect(AuthAPI.getRefreshToken()).toBe(null);
    expect(AuthAPI.getCurrentUser()).toBe(null);
  });

  test("should refresh access token successfully", async () => {
    localStorage.setItem("refreshToken", "refresh-abc");
    localStorage.setItem("user", JSON.stringify({ _id: "u1", email: "a@b.com" }));

    const mockFetch: any = global.fetch;
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          token: "new-token-1",
          refreshToken: "new-refresh-1",
        },
      }),
    });

    const response = await AuthAPI.refreshAccessToken();
    expect(response.success).toBe(true);
    expect(AuthAPI.getToken()).toBe("new-token-1");
    expect(AuthAPI.getRefreshToken()).toBe("new-refresh-1");
  });

  test("should return true only when token exists", () => {
    expect(AuthAPI.isAuthenticated()).toBe(false);

    localStorage.setItem("token", "123");
    expect(AuthAPI.isAuthenticated()).toBe(true);
  });
});

