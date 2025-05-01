export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    month: number;
    year: number;
    userId: string;
}
export interface Target {
    id: string;
    userId: string;
    category: string;
    type: 'income' | 'expense';
    targetAmount: number;
    currentAmount: number;
    createdAt: string;
    updatedAt: string;
}
export interface DashboardSummary {
    totalIncome: number;
    totalExpenses: number;
    availableBalance: number;
    netWorth: number;
}
export interface MonthData {
    transactions: Transaction[];
    targets: Target[];
    summary: DashboardSummary;
}
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    avatar: string;
}
export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor?: string[];
        borderWidth?: number;
    }[];
}
export declare const IncomeCategories: Record<string, string>;
export declare const ExpenseCategories: Record<string, string>;
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt?: string;
    userId?: number;
}
