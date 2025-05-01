import { AxiosInstance } from 'axios';
import { Transaction, Target, AuthUser, DashboardSummary, Notification } from '../types';
export declare const apiClient: AxiosInstance;
export declare const apiHelpers: {
    get: <T>(url: string, params?: any) => Promise<T>;
    post: <T>(url: string, data?: any) => Promise<T>;
    put: <T>(url: string, data?: any) => Promise<T>;
    delete: <T>(url: string) => Promise<T>;
    patch: <T>(url: string, data?: any) => Promise<T>;
};
export declare const AuthAPI: {
    register: (username: string, email: string, password: string, avatar: File) => Promise<AuthUser>;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<AuthUser | null>;
};
export declare const TransactionAPI: {
    getAll: (month?: number, year?: number) => Promise<Transaction[]>;
    create: (transaction: Omit<Transaction, "id">) => Promise<Transaction>;
    update: (id: string, transaction: Partial<Transaction>) => Promise<Transaction>;
    delete: (id: string) => Promise<void>;
};
export declare const TargetAPI: {
    getAll: () => Promise<Target[]>;
    create: (target: Omit<Target, "id" | "userId" | "currentAmount" | "createdAt" | "updatedAt">) => Promise<Target>;
    update: (id: string, target: Partial<Target>) => Promise<Target>;
    delete: (id: string) => Promise<void>;
};
export declare const MonthlyDataAPI: {
    getMonthlySummary: (month: number, year: number) => Promise<DashboardSummary>;
    getAvailableMonths: () => Promise<{
        month: number;
        year: number;
    }[]>;
};
export declare const NotificationAPI: {
    getAll: () => Promise<Notification[]>;
    create: (notification: Omit<Notification, "id" | "isRead" | "createdAt" | "userId">) => Promise<Notification>;
    markAsRead: (id: string | number) => Promise<Notification>;
    delete: (id: string | number) => Promise<void>;
    deleteRead: () => Promise<void>;
};
