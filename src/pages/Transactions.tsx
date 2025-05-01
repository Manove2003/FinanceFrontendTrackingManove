import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { ExpenseCategories, IncomeCategories, Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'month' | 'year' | 'userId'>>({
    type: 'income',
    amount: 0,
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      const numValue = parseFloat(value);
      setNewTransaction(prev => ({
        ...prev,
        amount: isNaN(numValue) || numValue < 0 ? 0 : numValue
      }));
    } else {
      setNewTransaction(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTransaction(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'income' | 'expense';
    const defaultCategory = type === 'income' ? 'Salary' : 'Housing';

    setNewTransaction(prev => ({
      ...prev,
      type,
      category: defaultCategory
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        userId: user.id , // Add userId
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
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert('Failed to add transaction');
    }
  };

  const filteredTransactions = (Array.isArray(transactions) ? transactions : [])
    .filter(transaction => 
      filter === 'all' ? true : transaction.type === filter
    )
    .filter(transaction => transaction.amount > 0)
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
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

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">Transactions</h1>
        <button 
          className="btn btn-primary w-full sm:w-auto"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>
      
      {showForm && (
        <div className="card mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleTypeChange}
                  className="select bg-dark w-full"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="input bg-dark w-full"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={newTransaction.category}
                  onChange={handleCategoryChange}
                  className="select bg-dark w-full"
                >
                  {newTransaction.type === 'income' ? (
                    Object.keys(IncomeCategories).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  ) : (
                    Object.keys(ExpenseCategories).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleInputChange}
                  className="input bg-dark w-full"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  placeholder="Description (optional)"
                  className="input bg-dark w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="card bg-gradient-to-br from-green-500/20 to-blue-500/20">
          <h3 className="text-sm text-gray-300 mb-1">Income</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-500">+${incomeTotal.toLocaleString()}</p>
        </div>
        
        <div className="card bg-gradient-to-br from-red-500/20 to-orange-500/20">
          <h3 className="text-sm text-gray-300 mb-1">Expenses</h3>
          <p className="text-xl sm:text-2xl font-bold text-red-500">-${expenseTotal.toLocaleString()}</p>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <h3 className="text-sm text-gray-300 mb-1">Balance</h3>
          <p className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${Math.abs(balance).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-dark.light rounded-lg p-3 sm:p-4">
        <div className="flex flex-wrap w-full md:w-auto gap-3 mb-3 md:mb-0">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Filter By
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="select bg-dark py-1 px-3 text-sm w-full sm:w-auto text-gray-400"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div className="w-1/2 sm:w-auto">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="select bg-dark py-1 px-3 text-sm w-full text-gray-400"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          
          <div className="w-1/2 sm:w-auto">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="select bg-dark py-1 px-3 text-sm w-full text-gray-400"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div className="text-gray-400 text-sm w-full md:w-auto text-center md:text-right">
          Showing {filteredTransactions.length} of {(Array.isArray(transactions) ? transactions : []).length} transactions
        </div>
      </div>
      
      <div className="card overflow-hidden p-0 sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark.light">
              <tr className="text-left text-gray-400 text-xs sm:text-sm">
                <th className="py-2 sm:py-3 pl-3 sm:pl-4">Type</th>
                <th className="py-2 sm:py-3 hidden xs:table-cell">Category</th>
                <th className="py-2 sm:py-3 hidden sm:table-cell">Description</th>
                <th className="py-2 sm:py-3 hidden md:table-cell">Date</th>
                <th className="py-2 sm:py-3 text-right">Amount</th>
                <th className="py-2 sm:py-3 text-right pr-3 sm:pr-4 w-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-t border-gray-800 hover:bg-dark">
                    <td className="py-2 sm:py-3 pl-3 sm:pl-4">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${transaction.type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'} flex items-center justify-center mr-2`}>
                          {transaction.type === 'income' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs sm:text-sm capitalize">{transaction.type}</span>
                          <span className="text-xs text-gray-500 xs:hidden">{transaction.category}</span>
                          <span className="text-xs text-gray-500 sm:hidden block xs:hidden">{transaction.description || '-'}</span>
                          <span className="text-xs text-gray-500 md:hidden block sm:hidden">{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 hidden xs:table-cell text-xs sm:text-sm">{transaction.category}</td>
                    <td className="py-2 sm:py-3 max-w-xs truncate hidden sm:table-cell text-xs sm:text-sm">{transaction.description || '-'}</td>
                    <td className="py-2 sm:py-3 hidden md:table-cell text-xs sm:text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className={`py-2 sm:py-3 text-right font-medium text-xs sm:text-sm ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-2 sm:py-3 text-right pr-3 sm:pr-4">
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete transaction"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;