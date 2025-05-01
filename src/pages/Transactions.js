import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { ExpenseCategories, IncomeCategories } from '../types';
import { useAuth } from '../contexts/AuthContext';
const Transactions = () => {
    const { transactions, addTransaction, deleteTransaction } = useFinance();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [newTransaction, setNewTransaction] = useState({
        type: 'income',
        amount: 0,
        category: 'Salary',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const numValue = parseFloat(value);
            setNewTransaction(prev => ({
                ...prev,
                amount: isNaN(numValue) || numValue < 0 ? 0 : numValue
            }));
        }
        else {
            setNewTransaction(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleCategoryChange = (e) => {
        setNewTransaction(prev => ({
            ...prev,
            category: e.target.value
        }));
    };
    const handleTypeChange = (e) => {
        const type = e.target.value;
        const defaultCategory = type === 'income' ? 'Salary' : 'Housing';
        setNewTransaction(prev => ({
            ...prev,
            type,
            category: defaultCategory
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newTransaction.amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }
        if (!user || !user.id) {
            alert('User not authenticated');
            return;
        }
        const transactionDate = new Date(newTransaction.date);
        if (isNaN(transactionDate.getTime())) {
            alert('Invalid date');
            return;
        }
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        try {
            await addTransaction({
                ...newTransaction,
                userId: user.id, // Add userId
                amount: Number(newTransaction.amount),
                month: transactionMonth,
                year: transactionYear,
            });
            setNewTransaction({
                type: 'income',
                amount: 0,
                category: 'Salary',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
            setShowForm(false);
        }
        catch (err) {
            console.error('Error adding transaction:', err);
            alert('Failed to add transaction');
        }
    };
    const filteredTransactions = (Array.isArray(transactions) ? transactions : [])
        .filter(transaction => filter === 'all' ? true : transaction.type === filter)
        .filter(transaction => transaction.amount > 0)
        .sort((a, b) => {
        if (sortBy === 'date') {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        else {
            const amountA = Number(a.amount) || 0;
            const amountB = Number(b.amount) || 0;
            return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
        }
    });
    const incomeTotal = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (isNaN(Number(t.amount)) ? 0 : Number(t.amount)), 0);
    const expenseTotal = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (isNaN(Number(t.amount)) ? 0 : Number(t.amount)), 0);
    const balance = incomeTotal - expenseTotal;
    return (_jsxs("div", { className: "flex-1 overflow-y-auto p-3 sm:p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6", children: [_jsx("h1", { className: "text-xl sm:text-2xl font-bold mb-4 sm:mb-0", children: "Transactions" }), _jsx("button", { className: "btn btn-primary w-full sm:w-auto", onClick: () => setShowForm(!showForm), children: showForm ? 'Cancel' : 'Add Transaction' })] }), showForm && (_jsxs("div", { className: "card mb-4 sm:mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add New Transaction" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Type" }), _jsxs("select", { name: "type", value: newTransaction.type, onChange: handleTypeChange, className: "select bg-dark w-full", children: [_jsx("option", { value: "income", children: "Income" }), _jsx("option", { value: "expense", children: "Expense" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Amount" }), _jsx("input", { type: "number", name: "amount", value: newTransaction.amount || '', onChange: handleInputChange, placeholder: "0.00", className: "input bg-dark w-full", min: "0.01", step: "0.01", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Category" }), _jsx("select", { name: "category", value: newTransaction.category, onChange: handleCategoryChange, className: "select bg-dark w-full", children: newTransaction.type === 'income' ? (Object.keys(IncomeCategories).map(category => (_jsx("option", { value: category, children: category }, category)))) : (Object.keys(ExpenseCategories).map(category => (_jsx("option", { value: category, children: category }, category)))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Date" }), _jsx("input", { type: "date", name: "date", value: newTransaction.date, onChange: handleInputChange, className: "input bg-dark w-full", required: true })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Description" }), _jsx("input", { type: "text", name: "description", value: newTransaction.description, onChange: handleInputChange, placeholder: "Description (optional)", className: "input bg-dark w-full" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", className: "btn btn-primary", children: "Add Transaction" }) })] })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6", children: [_jsxs("div", { className: "card bg-gradient-to-br from-green-500/20 to-blue-500/20", children: [_jsx("h3", { className: "text-sm text-gray-300 mb-1", children: "Income" }), _jsxs("p", { className: "text-xl sm:text-2xl font-bold text-green-500", children: ["+$", incomeTotal.toLocaleString()] })] }), _jsxs("div", { className: "card bg-gradient-to-br from-red-500/20 to-orange-500/20", children: [_jsx("h3", { className: "text-sm text-gray-300 mb-1", children: "Expenses" }), _jsxs("p", { className: "text-xl sm:text-2xl font-bold text-red-500", children: ["-$", expenseTotal.toLocaleString()] })] }), _jsxs("div", { className: "card bg-gradient-to-br from-blue-500/20 to-purple-500/20", children: [_jsx("h3", { className: "text-sm text-gray-300 mb-1", children: "Balance" }), _jsxs("p", { className: `text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`, children: ["$", Math.abs(balance).toLocaleString()] })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-dark.light rounded-lg p-3 sm:p-4", children: [_jsxs("div", { className: "flex flex-wrap w-full md:w-auto gap-3 mb-3 md:mb-0", children: [_jsxs("div", { className: "w-full sm:w-auto", children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Filter By" }), _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "select bg-dark py-1 px-3 text-sm w-full sm:w-auto text-gray-400", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "income", children: "Income" }), _jsx("option", { value: "expense", children: "Expense" })] })] }), _jsxs("div", { className: "w-1/2 sm:w-auto", children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Sort By" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "select bg-dark py-1 px-3 text-sm w-full text-gray-400", children: [_jsx("option", { value: "date", children: "Date" }), _jsx("option", { value: "amount", children: "Amount" })] })] }), _jsxs("div", { className: "w-1/2 sm:w-auto", children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Order" }), _jsxs("select", { value: sortOrder, onChange: (e) => setSortOrder(e.target.value), className: "select bg-dark py-1 px-3 text-sm w-full text-gray-400", children: [_jsx("option", { value: "desc", children: "Newest First" }), _jsx("option", { value: "asc", children: "Oldest First" })] })] })] }), _jsxs("div", { className: "text-gray-400 text-sm w-full md:w-auto text-center md:text-right", children: ["Showing ", filteredTransactions.length, " of ", (Array.isArray(transactions) ? transactions : []).length, " transactions"] })] }), _jsx("div", { className: "card overflow-hidden p-0 sm:p-4", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-dark.light", children: _jsxs("tr", { className: "text-left text-gray-400 text-xs sm:text-sm", children: [_jsx("th", { className: "py-2 sm:py-3 pl-3 sm:pl-4", children: "Type" }), _jsx("th", { className: "py-2 sm:py-3 hidden xs:table-cell", children: "Category" }), _jsx("th", { className: "py-2 sm:py-3 hidden sm:table-cell", children: "Description" }), _jsx("th", { className: "py-2 sm:py-3 hidden md:table-cell", children: "Date" }), _jsx("th", { className: "py-2 sm:py-3 text-right", children: "Amount" }), _jsx("th", { className: "py-2 sm:py-3 text-right pr-3 sm:pr-4 w-10", children: "Actions" })] }) }), _jsx("tbody", { children: filteredTransactions.length > 0 ? (filteredTransactions.map(transaction => (_jsxs("tr", { className: "border-t border-gray-800 hover:bg-dark", children: [_jsx("td", { className: "py-2 sm:py-3 pl-3 sm:pl-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-6 h-6 sm:w-8 sm:h-8 rounded-full ${transaction.type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'} flex items-center justify-center mr-2`, children: transaction.type === 'income' ? (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3 sm:h-4 sm:w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 10l7-7m0 0l7 7m-7-7v18" }) })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3 sm:h-4 sm:w-4 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) })) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-medium text-xs sm:text-sm capitalize", children: transaction.type }), _jsx("span", { className: "text-xs text-gray-500 xs:hidden", children: transaction.category }), _jsx("span", { className: "text-xs text-gray-500 sm:hidden block xs:hidden", children: transaction.description || '-' }), _jsx("span", { className: "text-xs text-gray-500 md:hidden block sm:hidden", children: new Date(transaction.date).toLocaleDateString() })] })] }) }), _jsx("td", { className: "py-2 sm:py-3 hidden xs:table-cell text-xs sm:text-sm", children: transaction.category }), _jsx("td", { className: "py-2 sm:py-3 max-w-xs truncate hidden sm:table-cell text-xs sm:text-sm", children: transaction.description || '-' }), _jsx("td", { className: "py-2 sm:py-3 hidden md:table-cell text-xs sm:text-sm", children: new Date(transaction.date).toLocaleDateString() }), _jsxs("td", { className: `py-2 sm:py-3 text-right font-medium text-xs sm:text-sm ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`, children: [transaction.type === 'income' ? '+' : '-', "$", Number(transaction.amount || 0).toLocaleString()] }), _jsx("td", { className: "py-2 sm:py-3 text-right pr-3 sm:pr-4", children: _jsx("button", { onClick: () => deleteTransaction(transaction.id), className: "text-gray-400 hover:text-red-500 transition-colors", "aria-label": "Delete transaction", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 sm:h-5 sm:w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) }) })] }, transaction.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-6 text-center text-gray-400", children: "No transactions found" }) })) })] }) }) })] }));
};
export default Transactions;
