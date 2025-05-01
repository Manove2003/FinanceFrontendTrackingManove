import React, { ReactNode } from 'react';
import { Transaction, Target, DashboardSummary, Notification, MonthData } from '../types';
interface FinanceContextType {
    transactions: Transaction[];
    targets: Target[];
    notifications: Notification[];
    summary: DashboardSummary;
    loading: boolean;
    error: string | null;
    currentMonth: string;
    currentYear: number;
    monthlyData: Record<string, MonthData>;
    setMonth: (month: number, year: number) => void;
    isMonthLocked: (month: number, year: number) => boolean;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addTarget: (target: Omit<Target, 'id' | 'userId' | 'currentAmount' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTarget: (id: string, target: Partial<Target>) => Promise<void>;
    deleteTarget: (id: string) => Promise<void>;
    markNotificationAsRead: (id: string | number) => Promise<void>;
    deleteNotification: (id: string | number) => Promise<void>;
    clearReadNotifications: () => Promise<void>;
}
export declare const useFinance: () => FinanceContextType;
interface FinanceProviderProps {
    children: ReactNode;
}
export declare const FinanceProvider: React.FC<FinanceProviderProps>;
export {};
