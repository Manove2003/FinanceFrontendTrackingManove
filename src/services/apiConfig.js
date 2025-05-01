import axios from 'axios';
const API_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5000/api';
const createApiClient = () => {
    const config = {
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    };
    const instance = axios.create(config);
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('financeTrackerToken');
        if (token && config.headers) {
            console.log('Adding token to request:', config.url, token.slice(0, 10) + '...');
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    });
    instance.interceptors.response.use((response) => {
        console.log('Response received:', response.config.url, response.data);
        return response;
    }, async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 &&
            error.response?.data?.message === 'Token expired, please refresh or log in again' &&
            !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                console.log('Attempting to refresh token for:', originalRequest.url);
                const response = await instance.post('/refresh-token', {});
                const { accessToken } = response.data;
                console.log('New access token received:', accessToken.slice(0, 10) + '...');
                localStorage.setItem('financeTrackerToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return instance(originalRequest);
            }
            catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                localStorage.removeItem('financeTrackerToken');
                localStorage.removeItem('financeTrackerUser');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        console.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
    });
    return instance;
};
export const apiClient = createApiClient();
export const apiHelpers = {
    get: async (url, params) => {
        console.log('GET request:', url, 'Params:', params);
        const response = await apiClient.get(url, { params });
        return (response.data.data ?? response.data);
    },
    post: async (url, data) => {
        console.log('POST request:', url, 'Data:', data);
        const response = await apiClient.post(url, data);
        return (response.data.data ?? response.data);
    },
    put: async (url, data) => {
        console.log('PUT request:', url, 'Data:', data);
        const response = await apiClient.put(url, data);
        return (response.data.data ?? response.data);
    },
    delete: async (url) => {
        console.log('DELETE request:', url);
        const response = await apiClient.delete(url);
        return (response.data.data ?? response.data);
    },
    patch: async (url, data) => {
        console.log('PATCH request:', url, 'Data:', data);
        const response = await apiClient.patch(url, data);
        return (response.data.data ?? response.data);
    },
};
export const AuthAPI = {
    register: async (username, email, password, avatar) => {
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
            }
            else {
                console.error('Signup response missing accessToken or user:', response.data);
                throw new Error('Invalid signup response');
            }
            return response.data.user;
        }
        catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },
    login: async (email, password) => {
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
            }
            else {
                console.error('Login response missing accessToken or user:', response.data);
                throw new Error('Invalid login response');
            }
            return response.data.user;
        }
        catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },
    logout: async () => {
        try {
            console.log('Logging out, calling /logout endpoint');
            await apiClient.post('/logout');
            console.log('Clearing localStorage');
            localStorage.removeItem('financeTrackerToken');
            localStorage.removeItem('financeTrackerUser');
        }
        catch (error) {
            console.error('Logout error:', error.response?.data || error.message);
            localStorage.removeItem('financeTrackerToken');
            localStorage.removeItem('financeTrackerUser');
            throw error;
        }
    },
    getCurrentUser: async () => {
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
        }
        catch (error) {
            console.error('Get current user error:', error.response?.data || error.message);
            console.log('Error status:', error.response?.status);
            return null;
        }
    },
};
export const TransactionAPI = {
    getAll: async (month, year) => {
        try {
            const params = {
                month: month !== undefined ? month : undefined,
                year: year !== undefined ? year : undefined,
            };
            const response = await apiHelpers.get('/transactions', params);
            console.log('Transactions fetched:', response);
            return response || [];
        }
        catch (error) {
            console.error('Get transactions error:', error);
            throw error;
        }
    },
    create: async (transaction) => {
        try {
            return apiHelpers.post('/transactions', transaction);
        }
        catch (error) {
            console.error('Create transaction error:', error);
            throw error;
        }
    },
    update: async (id, transaction) => {
        try {
            return apiHelpers.put(`/transactions/${id}`, transaction);
        }
        catch (error) {
            console.error('Update transaction error:', error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            return apiHelpers.delete(`/transactions/${id}`);
        }
        catch (error) {
            console.error('Delete transaction error:', error);
            throw error;
        }
    },
};
export const TargetAPI = {
    getAll: async () => {
        try {
            return apiHelpers.get('/targets');
        }
        catch (error) {
            console.error('Get targets error:', error);
            throw error;
        }
    },
    create: async (target) => {
        try {
            console.log('Sending target payload:', {
                category: target.category,
                type: target.type,
                targetAmount: Number(target.targetAmount),
            });
            return apiHelpers.post('/targets', {
                category: target.category,
                type: target.type,
                targetAmount: Number(target.targetAmount),
            });
        }
        catch (error) {
            console.error('Create target error:', error);
            throw error;
        }
    },
    update: async (id, target) => {
        try {
            return apiHelpers.put(`/targets/${id}`, {
                category: target.category,
                type: target.type,
                targetAmount: Number(target.targetAmount),
            });
        }
        catch (error) {
            console.error('Update target error:', error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            return apiHelpers.delete(`/targets/${id}`);
        }
        catch (error) {
            console.error('Delete target error:', error);
            throw error;
        }
    },
};
export const MonthlyDataAPI = {
    getMonthlySummary: async (month, year) => {
        try {
            const params = { year, month: month + 1 };
            const response = await apiHelpers.get('/monthly-data/summary', params);
            console.log('Monthly summary fetched:', response);
            return response || {
                totalIncome: 0,
                totalExpenses: 0,
                availableBalance: 0,
                netWorth: 0,
            };
        }
        catch (error) {
            console.error('Get monthly summary error:', error);
            throw error;
        }
    },
    getAvailableMonths: async () => {
        try {
            return apiHelpers.get('/monthly-data/available');
        }
        catch (error) {
            console.error('Get available months error:', error);
            throw error;
        }
    },
};
export const NotificationAPI = {
    getAll: async () => {
        return apiHelpers.get('/notifications');
    },
    create: async (notification) => {
        return apiHelpers.post('/notifications', notification);
    },
    delete: async (id) => {
        return apiHelpers.delete(`/notifications/${id}`);
    },
    deleteRead: async () => {
        return apiHelpers.delete('/notifications/read');
    },
    markAsRead: async (id) => {
        const response = await apiHelpers.patch(`/notifications/${id}/read`, { isRead: true });
        return response;
    },
};
