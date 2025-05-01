import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, AuthUser } from '../types';
import { AuthAPI } from '../services/api';
import { apiClient } from '../services/apiConfig';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, avatar: File) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isLoading: boolean;
  uploadAvatar: (file: File) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const USER_KEY = 'financeTrackerUser';
const TOKEN_KEY = 'financeTrackerToken';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const cachedUserData = localStorage.getItem(USER_KEY);
        const cachedUser = cachedUserData ? JSON.parse(cachedUserData) : null;
        console.log('Checking auth - Token:', token ? token.slice(0, 10) + '...' : 'missing', 'Cached user:', cachedUser);

        if (!token || !cachedUser) {
          console.log('No token or user, setting unauthenticated state');
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          return;
        }

        console.log('Verifying session with server');
        const user = await AuthAPI.getCurrentUser();
        console.log('getCurrentUser result:', user);

        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          setState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          console.log ('Invalid session, clearing storage');
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: 'Session invalid, please log in again',
          });
        }
      } catch (err: any) {
        console.error('Auth check error:', err.response?.data || err.message);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: err.response?.status === 401 ? 'Session expired, please log in again' : 'Failed to verify session',
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await AuthAPI.login(email, password);
      console.log('Login successful, user:', user);
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'Invalid credentials',
      }));
      throw err;
    }
  };

  const signup = async (username: string, email: string, password: string, avatar: File) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await AuthAPI.register(username, email, password, avatar);
      console.log('Signup successful, user:', user);
      if (!user.avatar) {
        console.warn('Avatar URL missing in signup response:', user);
      }
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'Failed to create account',
      }));
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log('Initiating logout');
      await AuthAPI.logout();
      console.log('Logout successful, clearing state');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Logout error:', err.response?.data || err.message);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to log out, session cleared',
      });
    }
  };

  const uploadAvatar = async (file: File): Promise<AuthUser> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const formData = new FormData(); // Create formData
      formData.append('avatar', file); // Use file
      const response = await apiClient.post('/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = response.data.user;
      console.log('Avatar upload successful, updated user:', updatedUser);
      if (!updatedUser.avatar) {
        console.warn('Avatar URL missing in upload response:', updatedUser);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setState((prev) => ({
        ...prev,
        user: updatedUser,
        loading: false,
        error: null,
      }));
      return updatedUser;
    } catch (err: any) {
      console.error('Avatar upload error:', err.response?.data || err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'Failed to upload avatar',
      }));
      throw err;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    uploadAvatar,
    clearError,
    isLoading: state.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};