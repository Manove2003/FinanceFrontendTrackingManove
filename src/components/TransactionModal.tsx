import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { ExpenseCategories, IncomeCategories } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: 'income' | 'expense';
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose,
  initialType
}) => {
  const { addTransaction, currentMonth, currentYear } = useFinance();
  const { user } = useAuth();
  
  const [transaction, setTransaction] = useState({
    type: initialType,
    amount: '',
    category: initialType === 'income' ? 'Salary' : 'Housing',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      setTransaction({
        type: initialType,
        amount: '',
        category: initialType === 'income' ? 'Salary' : 'Housing',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  }, [isOpen, initialType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    const defaultCategory = type === 'income' ? 'Salary' : 'Housing';
    
    setTransaction(prev => ({
      ...prev,
      type,
      category: defaultCategory
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(transaction.amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const transactionDate = new Date(transaction.date);
    const transactionMonthIndex = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();
    
    addTransaction({
      type: transaction.type,
      amount: amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
      userId: user?.id ?? '',
      month: transactionMonthIndex,
      year: transactionYear
    });
    
    onClose();
  };

  if (!isOpen) return null;

  const categoryOptions = transaction.type === 'income'
    ? Object.keys(IncomeCategories)
    : Object.keys(ExpenseCategories);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark max-w-md w-full rounded-lg shadow-lg overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex justify-between items-center p-4 bg-dark.light border-b border-gray-800">
          <h2 className="text-xl font-semibold">
            {transaction.type === 'income' ? 'Add Income' : 'Add Expense'}
          </h2>
          <span className="text-sm text-gray-400">{currentMonth} {currentYear}</span>
        </div>

        <div className="flex border-b border-gray-800">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              transaction.type === 'income' 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              transaction.type === 'expense' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <div className="flex items-start mb-4">
              <div className="mr-4">
                <div className={`w-12 h-12 rounded-full ${
                  transaction.type === 'income'
                    ? 'bg-green-500 bg-opacity-20 flex items-center justify-center' 
                    : 'bg-red-500 bg-opacity-20 flex items-center justify-center'
                }`}>
                  {transaction.type === 'income' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={transaction.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-dark.light text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categoryOptions.map(category => (
                    <option
                      key={category}
                      value={category}
                      className="bg-black text-white hover:bg-gray-700 hover:text-white"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-start mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="amount"
                    value={transaction.amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-8 rounded-md border border-gray-700 bg-dark.light text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <span className="absolute right-3 top-2 text-white">$</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Total:</span>
              <span className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                ${transaction.amount ? parseFloat(transaction.amount).toFixed(2) : '0.00'}
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={transaction.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md border border-gray-700 bg-dark.light text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="description"
                value={transaction.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md border border-gray-700 bg-dark.light text-white focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 rounded-md ${
                  transaction.type === 'income'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white transition-colors`}
              >
                Add {transaction.type === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;