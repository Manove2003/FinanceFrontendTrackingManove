import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/StatsCard';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import TransactionModal from '../components/TransactionModal';
const Dashboard = () => {
    const { transactions, summary, currentMonth, currentYear, isMonthLocked, setMonth, loading } = useFinance();
    const { user } = useAuth();
    const { id: monthId } = useParams();
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('income');
    useEffect(() => {
        if (monthId) {
            const monthIndex = parseInt(monthId) - 1;
            if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
                setMonth(monthIndex, currentYear);
            }
        }
    }, [monthId, setMonth, currentYear]);
    const openIncomeModal = () => {
        setModalType('income');
        setIsModalOpen(true);
    };
    const openExpenseModal = () => {
        setModalType('expense');
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const monthNameToIndex = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11,
    };
    const currentMonthIndex = monthNameToIndex[currentMonth] ?? 0;
    const safeSummary = {
        totalIncome: Number(summary?.totalIncome) || 0,
        totalExpenses: Number(summary?.totalExpenses) || 0,
        availableBalance: Number(summary?.availableBalance) || 0,
        netWorth: Number(summary?.netWorth) || 0,
    };
    const lineChartData = useMemo(() => {
        const monthlyIncome = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);
        console.log('Transactions for lineChartData:', transactions);
        if (Array.isArray(transactions)) {
            transactions.forEach(transaction => {
                const date = new Date(transaction.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                if (year === currentYear && transaction.amount) {
                    if (transaction.type === 'income') {
                        monthlyIncome[month] += Number(transaction.amount);
                    }
                    else {
                        monthlyExpenses[month] += Number(transaction.amount);
                    }
                }
            });
        }
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Income',
                    data: monthlyIncome,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Expenses',
                    data: monthlyExpenses,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    }, [transactions, currentYear]);
    const incomeCategories = useMemo(() => {
        console.log('Transactions for incomeCategories:', transactions);
        if (Array.isArray(transactions)) {
            return transactions
                .filter(t => t.type === 'income' && t.amount)
                .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                return acc;
            }, {});
        }
        return {};
    }, [transactions]);
    const incomeChartData = useMemo(() => ({
        labels: Object.keys(incomeCategories),
        datasets: [{
                data: Object.values(incomeCategories),
                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280'],
                borderWidth: 1,
            }],
    }), [incomeCategories]);
    const expenseCategories = useMemo(() => {
        console.log('Transactions for expenseCategories:', transactions);
        if (Array.isArray(transactions)) {
            return transactions
                .filter(t => t.type === 'expense' && t.amount)
                .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                return acc;
            }, {});
        }
        return {};
    }, [transactions]);
    const expenseChartData = useMemo(() => ({
        labels: Object.keys(expenseCategories),
        datasets: [{
                data: Object.values(expenseCategories),
                backgroundColor: ['#7c3aed', '#ef4444', '#f97316', '#0ea5e9', '#84cc16', '#14b8a6', '#ec4899', '#8b5cf6', '#64748b', '#6b7280'],
                borderWidth: 1,
            }],
    }), [expenseCategories]);
    const assetsData = {
        labels: ['Gold', 'Stocks', 'Land', 'Warehouse'],
        datasets: [{
                data: [15700, 22500, 120000, 135000],
                backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6'],
                borderWidth: 1,
            }],
    };
    const latestTransactions = useMemo(() => {
        if (Array.isArray(transactions)) {
            return [...transactions]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);
        }
        return [];
    }, [transactions]);
    if (loading) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center p-3 sm:p-6", children: _jsxs("div", { className: "text-center text-white", children: [_jsxs("svg", { className: "animate-spin h-8 w-8 text-primary mx-auto mb-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("p", { children: "Loading financial data..." })] }) }));
    }
    return (_jsxs("div", { className: "flex-1 overflow-y-auto p-3 sm:p-6 relative", children: [_jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-bold text-white", children: [currentMonth, " ", currentYear, isMonthLocked(currentMonthIndex, currentYear) && (_jsxs("span", { className: "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }), "Locked"] }))] }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("p", { className: "text-sm text-gray-400", children: "Welcome back," }), _jsx("h2", { className: "text-lg font-medium", children: user?.username || 'User' })] })] }), !isMonthLocked(currentMonthIndex, currentYear) && (_jsxs("div", { className: "fixed bottom-6 right-6 flex flex-col space-y-4 z-10", children: [_jsx("button", { onClick: openIncomeModal, className: "w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors", "aria-label": "Add income", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }) }), _jsx("button", { onClick: openExpenseModal, className: "w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors", "aria-label": "Add expense", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 12H4" }) }) })] })), _jsx(TransactionModal, { isOpen: isModalOpen, onClose: closeModal, initialType: modalType }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-3 sm:mb-6", children: [_jsx(StatsCard, { title: "Total Income", value: safeSummary.totalIncome, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), trend: { value: 13, isPositive: true } }), _jsx(StatsCard, { title: "Total Expenses", value: safeSummary.totalExpenses, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }), trend: { value: 8, isPositive: false } }), _jsx(StatsCard, { title: "Available Balance", value: safeSummary.availableBalance, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-blue-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" }) }), trend: { value: 5, isPositive: true } }), _jsx(StatsCard, { title: "Net Worth", value: safeSummary.netWorth, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-purple-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }) }), trend: { value: 7, isPositive: true } })] }), _jsxs("div", { className: "card mb-3 sm:mb-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Income & Expenses" }), _jsxs("div", { className: "bg-dark rounded-lg flex flex-wrap w-full sm:w-auto", children: [_jsx("button", { className: `px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'day' ? 'bg-dark.light' : ''}`, onClick: () => setSelectedPeriod('day'), children: "Day" }), _jsx("button", { className: `px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'week' ? 'bg-dark.light' : ''}`, onClick: () => setSelectedPeriod('week'), children: "Week" }), _jsx("button", { className: `px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'month' ? 'bg-dark.light' : ''}`, onClick: () => setSelectedPeriod('month'), children: "Month" }), _jsx("button", { className: `px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'year' ? 'bg-dark.light' : ''}`, onClick: () => setSelectedPeriod('year'), children: "Year" })] })] }), _jsx(LineChart, { data: lineChartData, height: 300 })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-3 sm:mb-6", children: [_jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Income Categories" }), _jsxs("div", { className: "relative", children: [_jsx(PieChart, { data: incomeChartData, height: 220 }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-400", children: "Total" }), _jsxs("p", { className: "text-xl font-semibold", children: ["$", safeSummary.totalIncome.toLocaleString()] })] }) })] }), _jsx("div", { className: "mt-4 space-y-2", children: Object.entries(incomeCategories).map(([category, amount], index) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "w-3 h-3 rounded-full mr-2", style: { backgroundColor: incomeChartData.datasets[0].backgroundColor[index % incomeChartData.datasets[0].backgroundColor.length] } }), _jsx("span", { className: "text-sm", children: category })] }), _jsxs("span", { className: "text-sm", children: ["$", Number(amount).toLocaleString()] })] }, category))) })] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Expense Categories" }), _jsxs("div", { className: "relative", children: [_jsx(PieChart, { data: expenseChartData, height: 220 }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-400", children: "Total" }), _jsxs("p", { className: "text-xl font-semibold", children: ["$", safeSummary.totalExpenses.toLocaleString()] })] }) })] }), _jsx("div", { className: "mt-4 space-y-2 overflow-y-auto max-h-32 pr-1", children: Object.entries(expenseCategories).map(([category, amount], index) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "w-3 h-3 rounded-full mr-2", style: { backgroundColor: expenseChartData.datasets[0].backgroundColor[index % expenseChartData.datasets[0].backgroundColor.length] } }), _jsx("span", { className: "text-sm", children: category })] }), _jsxs("span", { className: "text-sm", children: ["$", Number(amount).toLocaleString()] })] }, category))) })] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Asset Allocation" }), _jsxs("div", { className: "relative", children: [_jsx(PieChart, { data: assetsData, height: 220 }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-400", children: "Total" }), _jsxs("p", { className: "text-xl font-semibold", children: ["$", assetsData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()] })] }) })] }), _jsx("div", { className: "mt-4 space-y-2", children: assetsData.labels.map((label, index) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "w-3 h-3 rounded-full mr-2", style: { backgroundColor: assetsData.datasets[0].backgroundColor[index] } }), _jsx("span", { className: "text-sm", children: label })] }), _jsxs("span", { className: "text-sm", children: ["$", assetsData.datasets[0].data[index].toLocaleString()] })] }, label))) })] })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Latest Transactions" }), _jsx("button", { className: "text-primary hover:text-blue-700 text-sm font-medium", children: "View All" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-400 text-sm", children: [_jsx("th", { className: "pb-3", children: "Type" }), _jsx("th", { className: "pb-3", children: "Category" }), _jsx("th", { className: "pb-3 hidden sm:table-cell", children: "Date" }), _jsx("th", { className: "pb-3 text-right", children: "Amount" })] }) }), _jsx("tbody", { children: latestTransactions.length > 0 ? (latestTransactions.map(transaction => (_jsxs("tr", { className: "border-t border-gray-800", children: [_jsx("td", { className: "py-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full ${transaction.type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'} flex items-center justify-center mr-2`, children: transaction.type === 'income' ? (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 10l7-7m0 0l7 7m-7-7v18" }) })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) })) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-[200px]", children: transaction.description || transaction.category }), _jsx("span", { className: "text-xs text-gray-400 sm:hidden", children: new Date(transaction.date).toLocaleDateString() })] })] }) }), _jsx("td", { className: "py-3 text-gray-400 text-sm", children: transaction.category }), _jsx("td", { className: "py-3 text-gray-400 hidden sm:table-cell", children: new Date(transaction.date).toLocaleDateString() }), _jsxs("td", { className: `py-3 text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`, children: [transaction.type === 'income' ? '+' : '-', "$", Number(transaction.amount).toLocaleString()] })] }, transaction.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "py-4 text-center text-gray-400", children: "No transactions yet. Add your first transaction!" }) })) })] }) })] }), isMonthLocked(currentMonthIndex, currentYear) && (_jsxs("div", { className: "mt-6 bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8 mx-auto mb-2 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }), _jsx("h3", { className: "text-lg font-medium text-white", children: "Future Month Locked" }), _jsx("p", { className: "text-gray-400 mt-2", children: "You cannot add transactions to future months. Please select the current month or a past month to add transactions." })] }))] }));
};
export default Dashboard;
