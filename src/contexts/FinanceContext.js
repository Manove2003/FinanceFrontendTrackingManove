import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { TransactionAPI, TargetAPI, MonthlyDataAPI, NotificationAPI } from '../services/api';
import { useAuth } from './AuthContext';
const SUMMARY_STORAGE_KEY = 'financeTrackerSummary';
const MONTHLY_DATA_STORAGE_KEY = 'financeTrackerMonthlyData';
const FinanceContext = createContext(undefined);
export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
const getStoredSummary = () => {
    try {
        const storedSummary = localStorage.getItem(SUMMARY_STORAGE_KEY);
        if (storedSummary) {
            const parsedSummary = JSON.parse(storedSummary);
            return {
                totalIncome: Number(parsedSummary.totalIncome) || 0,
                totalExpenses: Number(parsedSummary.totalExpenses) || 0,
                availableBalance: Number(parsedSummary.availableBalance) || 0,
                netWorth: Number(parsedSummary.netWorth) || 0,
            };
        }
    }
    catch (error) {
        console.error('Failed to parse stored summary:', error);
    }
    return null;
};
const getStoredMonthlyData = () => {
    try {
        const storedMonthlyData = localStorage.getItem(MONTHLY_DATA_STORAGE_KEY);
        if (storedMonthlyData) {
            return JSON.parse(storedMonthlyData);
        }
    }
    catch (error) {
        console.error('Failed to parse stored monthly data:', error);
    }
    return null;
};
export const FinanceProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const now = new Date();
    const [transactions, setTransactions] = useState([]);
    const [targets, setTargets] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [summary, setSummary] = useState(() => {
        return getStoredSummary() || {
            totalIncome: 0,
            totalExpenses: 0,
            availableBalance: 0,
            netWorth: 0,
        };
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(now.toLocaleString('default', { month: 'long' }));
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [monthlyData, setMonthlyData] = useState(() => {
        return getStoredMonthlyData() || {};
    });
    useEffect(() => {
        if (summary && summary.availableBalance !== 0) {
            try {
                localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
            }
            catch (error) {
                console.error('Failed to store summary in localStorage:', error);
            }
        }
    }, [summary]);
    useEffect(() => {
        if (Object.keys(monthlyData).length > 0) {
            try {
                localStorage.setItem(MONTHLY_DATA_STORAGE_KEY, JSON.stringify(monthlyData));
            }
            catch (error) {
                console.error('Failed to store monthly data in localStorage:', error);
            }
        }
    }, [monthlyData]);
    const setMonth = (month, year) => {
        const date = new Date(year, month);
        setCurrentMonth(date.toLocaleString('default', { month: 'long' }));
        setCurrentYear(year);
        loadMonthData(month, year);
    };
    const isMonthLocked = (month, year) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return year > currentYear || (year === currentYear && month > currentMonth);
    };
    const loadMonthData = async (month, year) => {
        try {
            setLoading(true);
            const monthKey = `${year}-${month + 1}`;
            if (monthlyData[monthKey]) {
                setTransactions(monthlyData[monthKey].transactions || []);
                setTargets(monthlyData[monthKey].targets || []);
                setSummary(monthlyData[monthKey].summary || {
                    totalIncome: 0,
                    totalExpenses: 0,
                    availableBalance: 0,
                    netWorth: 0,
                });
                setLoading(false);
                return;
            }
            const [transactionsResponse, targetsResponse, notificationsResponse] = await Promise.all([
                TransactionAPI.getAll(month, year),
                TargetAPI.getAll(),
                NotificationAPI.getAll(),
            ]);
            setTransactions(transactionsResponse || []);
            setTargets(targetsResponse || []);
            setNotifications(notificationsResponse || []);
            let monthlySummary;
            try {
                monthlySummary = await MonthlyDataAPI.getMonthlySummary(month, year);
            }
            catch (err) {
                console.error('Error fetching monthly summary:', err);
                monthlySummary = calculateSummaryData(transactionsResponse || []);
            }
            setSummary(monthlySummary);
            setMonthlyData((prev) => ({
                ...prev,
                [monthKey]: {
                    transactions: transactionsResponse || [],
                    targets: targetsResponse || [],
                    summary: monthlySummary,
                },
            }));
            checkTargets(transactionsResponse || [], targetsResponse || []);
        }
        catch (err) {
            console.error('Error loading month data:', err);
            setError('Failed to load data for selected month');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateSummaryData = (transactionsData) => {
        const totalIncome = transactionsData
            .filter((t) => t.type === 'income' && t.amount > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactionsData
            .filter((t) => t.type === 'expense' && t.amount > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const availableBalance = totalIncome - totalExpenses;
        const netWorth = availableBalance;
        return {
            totalIncome,
            totalExpenses,
            availableBalance,
            netWorth,
        };
    };
    useEffect(() => {
        if (!isAuthenticated) {
            setTransactions([]);
            setTargets([]);
            setNotifications([]);
            setSummary({
                totalIncome: 0,
                totalExpenses: 0,
                availableBalance: 0,
                netWorth: 0,
            });
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                setLoading(true);
                const monthNumber = new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth();
                await loadMonthData(monthNumber, currentYear);
            }
            catch (err) {
                setError('Failed to fetch data');
                console.error('Error fetching data:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, user, currentMonth, currentYear]);
    const checkTargets = async (transactions, targets) => {
        if (!Array.isArray(targets) || !Array.isArray(transactions)) {
            console.warn('Invalid input: targets or transactions is not an array:', { targets, transactions });
            return;
        }
        const newNotifications = [];
        targets.forEach((target) => {
            if (!target.targetAmount || !['income', 'expense'].includes(target.type)) {
                console.warn('Invalid target:', target);
                return;
            }
            const progress = target.targetAmount > 0 ? (target.currentAmount / target.targetAmount) * 100 : 0;
            if (target.type === 'income' && target.currentAmount >= target.targetAmount) {
                newNotifications.push({
                    title: 'Income Goal Achieved',
                    message: `Congratulations! You've reached your income target of ${formatCurrency(target.targetAmount)} for ${target.category}`,
                    type: 'success',
                });
            }
            else if (target.type === 'expense' && target.currentAmount >= target.targetAmount) {
                newNotifications.push({
                    title: 'Expense Limit Exceeded',
                    message: `Warning! You've exceeded your expense limit of ${formatCurrency(target.targetAmount)} for ${target.category}`,
                    type: 'warning',
                });
            }
            else if (progress >= 80 && progress < 100) {
                newNotifications.push({
                    title: target.type === 'income' ? 'Approaching Income Goal' : 'Approaching Expense Limit',
                    message: `${target.type === 'income' ? "You're close to reaching" : 'Warning!'} You're at ${Math.min(progress, 100).toFixed(1)}% of your ${target.type} target (${formatCurrency(target.targetAmount)}) for ${target.category}`,
                    type: target.type === 'income' ? 'success' : 'info',
                });
            }
        });
        if (newNotifications.length > 0) {
            try {
                await Promise.all(newNotifications.map((notification) => NotificationAPI.create(notification)));
                const updatedNotifications = await NotificationAPI.getAll();
                setNotifications(updatedNotifications);
            }
            catch (error) {
                console.error('Error saving notifications:', error);
                setError('Failed to save notifications');
            }
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };
    const addTransaction = async (transaction) => {
        try {
            setLoading(true);
            if (transaction.amount <= 0)
                throw new Error('Transaction amount must be greater than 0');
            if (!['income', 'expense'].includes(transaction.type))
                throw new Error('Invalid transaction type');
            if (!user || !user.id)
                throw new Error('User ID is required'); // Add type guard
            const transactionDate = new Date(transaction.date);
            const transactionMonth = transactionDate.getMonth();
            const transactionYear = transactionDate.getFullYear();
            const newTransactionPayload = {
                ...transaction,
                userId: user.id, // Now guaranteed to be string
                amount: Number(transaction.amount),
                month: transactionMonth,
                year: transactionYear,
            };
            const newTransaction = await TransactionAPI.create(newTransactionPayload);
            const monthKey = `${transactionYear}-${transactionMonth + 1}`;
            const currentMonthIndex = new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth();
            const currentMonthKey = `${currentYear}-${currentMonthIndex + 1}`;
            setTransactions((prev) => {
                const updatedTransactions = [...prev, newTransaction].filter((t) => t.amount > 0);
                if (monthKey === currentMonthKey) {
                    const updatedSummary = calculateSummaryData(updatedTransactions);
                    setSummary(updatedSummary);
                }
                return updatedTransactions;
            });
            setMonthlyData((prev) => {
                const existingMonthData = prev[monthKey] || {
                    transactions: [],
                    targets: targets || [],
                    summary: { totalIncome: 0, totalExpenses: 0, availableBalance: 0, netWorth: 0 },
                };
                const updatedTransactions = [...(existingMonthData.transactions || []), newTransaction].filter((t) => t.amount > 0);
                const updatedSummary = calculateSummaryData(updatedTransactions);
                return {
                    ...prev,
                    [monthKey]: { ...existingMonthData, transactions: updatedTransactions, summary: updatedSummary },
                };
            });
            const updatedTargets = await TargetAPI.getAll();
            setTargets(updatedTargets);
            setMonthlyData((prev) => ({
                ...prev,
                [monthKey]: { ...prev[monthKey], targets: updatedTargets },
            }));
            checkTargets([...transactions, newTransaction], updatedTargets);
        }
        catch (err) {
            setError('Failed to add transaction');
            console.error('Error adding transaction:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    const deleteTransaction = async (id) => {
        try {
            setLoading(true);
            const deletedTransaction = transactions.find((t) => t.id === id);
            if (!deletedTransaction) {
                console.error('Transaction not found for deletion:', id);
                return;
            }
            await TransactionAPI.delete(id);
            const transactionMonth = deletedTransaction.month;
            const transactionYear = deletedTransaction.year || currentYear;
            const monthKey = `${transactionYear}-${transactionMonth + 1}`;
            const currentMonthIndex = new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth();
            const currentMonthKey = `${currentYear}-${currentMonthIndex + 1}`;
            setTransactions((prev) => {
                const updatedTransactions = prev.filter((t) => t.id !== id);
                if (monthKey === currentMonthKey) {
                    const updatedSummary = calculateSummaryData(updatedTransactions);
                    setSummary(updatedSummary);
                }
                return updatedTransactions;
            });
            setMonthlyData((prev) => {
                const existingMonthData = prev[monthKey];
                if (!existingMonthData) {
                    console.error('Monthly data not found for the transaction:', monthKey);
                    return prev;
                }
                const updatedTransactions = existingMonthData.transactions.filter((t) => t.id !== id);
                const updatedSummary = calculateSummaryData(updatedTransactions);
                return {
                    ...prev,
                    [monthKey]: { ...existingMonthData, transactions: updatedTransactions, summary: updatedSummary },
                };
            });
            const updatedTargets = await TargetAPI.getAll();
            setTargets(updatedTargets);
            setMonthlyData((prev) => ({
                ...prev,
                [monthKey]: { ...prev[monthKey], targets: updatedTargets },
            }));
            checkTargets(transactions.filter((t) => t.id !== id), updatedTargets);
        }
        catch (err) {
            setError('Failed to delete transaction');
            console.error('Error deleting transaction:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    const addTarget = async (target) => {
        try {
            setLoading(true);
            if (!target.targetAmount || !['income', 'expense'].includes(target.type)) {
                throw new Error('Invalid target: amount and valid type are required');
            }
            const targetPayload = {
                category: target.category,
                type: target.type,
                targetAmount: Number(target.targetAmount),
            };
            const newTarget = await TargetAPI.create(targetPayload);
            const updatedTargets = [...targets, newTarget].filter((t) => t.targetAmount > 0 && ['income', 'expense'].includes(t.type));
            setTargets(updatedTargets);
            const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
            setMonthlyData((prev) => ({
                ...prev,
                [monthKey]: { ...prev[monthKey], targets: updatedTargets },
            }));
            checkTargets(transactions, updatedTargets);
        }
        catch (err) {
            setError('Failed to add target');
            console.error('Error adding target:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    const updateTarget = async (id, target) => {
        try {
            setLoading(true);
            // Add type guards
            if (!target.category || !target.type || target.targetAmount === undefined) {
                throw new Error('Category, type, and target amount are required');
            }
            if (!['income', 'expense'].includes(target.type)) {
                throw new Error('Invalid target type');
            }
            const targetPayload = {
                category: target.category,
                type: target.type,
                targetAmount: Number(target.targetAmount),
            };
            const updatedTarget = await TargetAPI.update(id, targetPayload);
            const updatedTargets = targets
                .map((t) => (t.id === id ? updatedTarget : t))
                .filter((t) => t.targetAmount > 0 && ['income', 'expense'].includes(t.type));
            setTargets(updatedTargets);
            const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
            setMonthlyData((prev) => ({
                ...prev,
                [monthKey]: { ...prev[monthKey], targets: updatedTargets },
            }));
            checkTargets(transactions, updatedTargets);
        }
        catch (err) {
            setError('Failed to update target');
            console.error('Error updating target:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    const deleteTarget = async (id) => {
        try {
            setLoading(true);
            await TargetAPI.delete(id);
            const updatedTargets = targets.filter((t) => t.id !== id);
            setTargets(updatedTargets);
            const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
            setMonthlyData((prev) => ({
                ...prev,
                [monthKey]: { ...prev[monthKey], targets: updatedTargets },
            }));
            checkTargets(transactions, updatedTargets);
        }
        catch (err) {
            setError('Failed to delete target');
            console.error('Error deleting target:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    const markNotificationAsRead = async (id) => {
        try {
            const updatedNotification = await NotificationAPI.markAsRead(id);
            setNotifications((prev) => prev.map((notification) => notification.id === id ? { ...notification, isRead: updatedNotification.isRead } : notification));
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            setError('Failed to mark notification as read');
        }
    };
    const deleteNotification = async (id) => {
        try {
            await NotificationAPI.delete(id);
            setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            setError('Failed to delete notification');
        }
    };
    const clearReadNotifications = async () => {
        try {
            await NotificationAPI.deleteRead();
            setNotifications((prev) => prev.filter((notification) => !notification.isRead));
        }
        catch (error) {
            console.error('Error clearing read notifications:', error);
            setError('Failed to clear read notifications');
        }
    };
    return (_jsx(FinanceContext.Provider, { value: {
            transactions,
            targets,
            notifications,
            summary,
            loading,
            error,
            currentMonth,
            currentYear,
            monthlyData,
            setMonth,
            isMonthLocked,
            addTransaction,
            deleteTransaction,
            addTarget,
            updateTarget,
            deleteTarget,
            markNotificationAsRead,
            deleteNotification,
            clearReadNotifications,
        }, children: children }));
};
