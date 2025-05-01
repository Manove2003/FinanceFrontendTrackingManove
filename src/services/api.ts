import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Transaction, Target, AuthUser, DashboardSummary, Notification } from '../types';

const API_URL = import.meta.env.VITE_APP_URL || 'https://financebackendtrackingmanove.onrender.com/api';

const createApiClient = (): AxiosInstance => {
  const config: AxiosRequestConfig = {
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  };

  const instance = axios.create(config);

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('financeTrackerToken');
      if (token && config.headers) {
        console.log('Adding token to request:', config.url, token.slice(0, 10) + '...');
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      console.log('Response received:', response.config.url, response.data);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        error.response?.data?.message === 'Token expired, please refresh or log in again' &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          console.log('Attempting to refresh token for:', originalRequest.url);
          const response = await instance.post('/refresh-token', {});
          const { accessToken } = response.data;
          console.log('New access token received:', accessToken.slice(0, 10) + '...');
          localStorage.setItem('financeTrackerToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          localStorage.removeItem('financeTrackerToken');
          localStorage.removeItem('financeTrackerUser');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      console.error('Response error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiClient();

interface ApiResponse<T> {
  data?: T;
}

export const apiHelpers = {
  get: async <T>(url: string, params?: any): Promise<T> => {
    console.log('GET request:', url, 'Params:', params);
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return (response.data.data ?? response.data) as T; // Type assertion
  },
  post: async <T>(url: string, data?: any): Promise<T> => {
    console.log('POST request:', url, 'Data:', data);
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return (response.data.data ?? response.data) as T; // Type assertion
  },
  put: async <T>(url: string, data?: any): Promise<T> => {
    console.log('PUT request:', url, 'Data:', data);
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return (response.data.data ?? response.data) as T; // Type assertion
  },
  delete: async <T>(url: string): Promise<T> => {
    console.log('DELETE request:', url);
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return (response.data.data ?? response.data) as T; // Type assertion
  },
  patch: async <T>(url: string, data?: any): Promise<T> => {
      console.log('PATCH request:', url, 'Data:', data);
      const response = await apiClient.patch<ApiResponse<T>>(url, data);
      return (response.data.data ?? response.data) as T;
    },
};


export const AuthAPI = {
  register: async (username: string, email: string, password: string, avatar: File): Promise<AuthUser> => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('avatar', avatar);

      console.log('Registering user with payload:', { username, email, password: '****', avatar: avatar.name });
      const response = await apiClient.post('/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Signup response:', response.data);

      if (response.data.accessToken && response.data.user) {
        console.log('Saving to localStorage:', {
          accessToken: response.data.accessToken.slice(0, 10) + '...',
          user: response.data.user,
        });
        localStorage.setItem('financeTrackerToken', response.data.accessToken);
        localStorage.setItem('financeTrackerUser', JSON.stringify(response.data.user));
      } else {
        console.error('Signup response missing accessToken or user:', response.data);
        throw new Error('Invalid signup response');
      }
      return response.data.user;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    try {
      console.log('Logging in with payload:', { email, password: '****' });
      const response = await apiClient.post('/login', { email, password });
      console.log('Login response:', response.data);

      if (response.data.accessToken && response.data.user) {
        console.log('Saving to localStorage:', {
          accessToken: response.data.accessToken.slice(0, 10) + '...',
          user: response.data.user,
        });
        localStorage.setItem('financeTrackerToken', response.data.accessToken);
        localStorage.setItem('financeTrackerUser', JSON.stringify(response.data.user));
        console.log('Stored token:', localStorage.getItem('financeTrackerToken')?.slice(0, 10) + '...');
        console.log('Stored user:', localStorage.getItem('financeTrackerUser'));
      } else {
        console.error('Login response missing accessToken or user:', response.data);
        throw new Error('Invalid login response');
      }
      return response.data.user;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log('Logging out, calling /logout endpoint');
      await apiClient.post('/logout');
      console.log('Clearing localStorage');
      localStorage.removeItem('financeTrackerToken');
      localStorage.removeItem('financeTrackerUser');
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
      localStorage.removeItem('financeTrackerToken');
      localStorage.removeItem('financeTrackerUser');
      throw error;
    }
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const token = localStorage.getItem('financeTrackerToken');
      console.log('getCurrentUser - Token:', token ? token.slice(0, 10) + '...' : 'missing');
      if (!token) {
        console.log('No token, returning null');
        return null;
      }

      const response = await apiClient.get('/protected', {
        headers: { 'X-Skip-Redirect': 'true' },
      });
      console.log('getCurrentUser response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      console.log('Error status:', error.response?.status);
      return null;
    }
  },
};

export const TransactionAPI = {
  getAll: async (month?: number, year?: number): Promise<Transaction[]> => {
    try {
      const params = {
        month: month !== undefined ? month : undefined,
        year: year !== undefined ? year : undefined,
      };
      const response = await apiHelpers.get<Transaction[]>('/transactions', params);
      console.log('Transactions fetched:', response);
      return response || [];
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      return apiHelpers.post<Transaction>('/transactions', transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  },

  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      return apiHelpers.put<Transaction>(`/transactions/${id}`, transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      return apiHelpers.delete(`/transactions/${id}`);
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  },
};

export const TargetAPI = {
  getAll: async (): Promise<Target[]> => {
    try {
      return apiHelpers.get<Target[]>('/targets');
    } catch (error) {
      console.error('Get targets error:', error);
      throw error;
    }
  },

  create: async (target: Omit<Target, 'id' | 'userId' | 'currentAmount' | 'createdAt' | 'updatedAt'>): Promise<Target> => {
    try {
      console.log('Sending target payload:', {
        category: target.category,
        type: target.type,
        targetAmount: Number(target.targetAmount),
      });
      return apiHelpers.post<Target>('/targets', {
        category: target.category,
        type: target.type,
        targetAmount: Number(target.targetAmount),
      });
    } catch (error) {
      console.error('Create target error:', error);
      throw error;
    }
  },

  update: async (id: string, target: Partial<Target>): Promise<Target> => {
    try {
      return apiHelpers.put<Target>(`/targets/${id}`, {
        category: target.category,
        type: target.type,
        targetAmount: Number(target.targetAmount),
      });
    } catch (error) {
      console.error('Update target error:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      return apiHelpers.delete(`/targets/${id}`);
    } catch (error) {
      console.error('Delete target error:', error);
      throw error;
    }
  },
};

export const MonthlyDataAPI = {
  getMonthlySummary: async (month: number, year: number): Promise<DashboardSummary> => {
    try {
      const params = { year, month: month + 1 };
      const response = await apiHelpers.get<DashboardSummary>('/monthly-data/summary', params);
      console.log('Monthly summary fetched:', response);
      return response || {
        totalIncome: 0,
        totalExpenses: 0,
        availableBalance: 0,
        netWorth: 0,
      };
    } catch (error) {
      console.error('Get monthly summary error:', error);
      throw error;
    }
  },

  getAvailableMonths: async (): Promise<{ month: number; year: number }[]> => {
    try {
      return apiHelpers.get<{ month: number; year: number }[]>('/monthly-data/available');
    } catch (error) {
      console.error('Get available months error:', error);
      throw error;
    }
  },
};

export const NotificationAPI = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const response = await apiHelpers.get<{ success: boolean; count: number; data: Notification[] }>('/notifications');
      return response.data || [];
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  create: async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt' | 'userId'>): Promise<Notification> => {
    try {
      return apiHelpers.post<Notification>('/notifications', notification);
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  },

  markAsRead: async (id: string | number): Promise<Notification> => {
    try {
      return apiHelpers.patch<Notification>(`/notifications/${id}/read`, {});
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  delete: async (id: string | number): Promise<void> => {
    try {
      return apiHelpers.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  deleteRead: async (): Promise<void> => {
    try {
      return apiHelpers.delete('/notifications/read');
    } catch (error) {
      console.error('Delete read notifications error:', error);
      throw error;
    }
  },

};
