import React, { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import {
  authApi,
  persistAuthData,
  clearSession,
  getStoredUser,
  getValidToken as _getValidToken,
} from '../services/authApi';
import { getRefreshToken } from '../services/secureSession';
import type { StoredUser } from '../services/secureSession';


export type AuthUser = StoredUser;

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

type AuthAction =
  | { type: 'RESTORE'; user: AuthUser }
  | { type: 'LOGIN';   user: AuthUser }
  | { type: 'LOGOUT' }
  | { type: 'DONE_LOADING' }
  | { type: 'UPDATE_USER'; fields: Partial<AuthUser> };

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE':
    case 'LOGIN':
      return { user: action.user, isLoggedIn: true, isLoading: false };
    case 'LOGOUT':
      return { user: null, isLoggedIn: false, isLoading: false };
    case 'DONE_LOADING':
      return { ...state, isLoading: false };
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.fields } } : state;
    default:
      return state;
  }
};

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<AuthUser>) => void;
  getValidToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    user: null, isLoading: true, isLoggedIn: false,
  });

  
  useEffect(() => {
    getStoredUser().then(user => {
      if (user) dispatch({ type: 'RESTORE', user });
      else      dispatch({ type: 'DONE_LOADING' });
    }).catch(() => dispatch({ type: 'DONE_LOADING' }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email: email.toLowerCase().trim(), password });
    if (!result.success || !result.data) {
      return { success: false, error: 'Login failed' };
    }
    const { user, accessToken, refreshToken, accessTokenExpiresIn } = result.data;
    if (!user || !accessToken || !refreshToken) {
      return { success: false, error: 'Incomplete auth response' };
    }
    await persistAuthData({ user, accessToken, refreshToken, accessTokenExpiresIn });
    dispatch({ type: 'LOGIN', user });
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authApi.register({ name, email: email.toLowerCase().trim(), password });
    if (!result.success || !result.data) {
      return { success: false, error: 'Registration failed' };
    }
    const { user, accessToken, refreshToken, accessTokenExpiresIn } = result.data;
    if (!user || !accessToken || !refreshToken) {
      return { success: false, error: 'Incomplete auth response' };
    }
    await persistAuthData({ user, accessToken, refreshToken, accessTokenExpiresIn });
    dispatch({ type: 'LOGIN', user });
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = await _getValidToken();
      const refreshToken = await getRefreshToken();
      if (token && refreshToken) {
        await authApi.logout({ refreshToken }, token).catch(() => {});
      }
    } finally {
      await clearSession();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((fields: Partial<AuthUser>) => {
    dispatch({ type: 'UPDATE_USER', fields });
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateUser,
      getValidToken: _getValidToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
