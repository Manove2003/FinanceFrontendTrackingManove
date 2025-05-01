import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/StatsCard';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import TransactionModal from '../components/TransactionModal';

const Dashboard: React.FC = () => {
  const { transactions, summary, currentMonth, currentYear, isMonthLocked, setMonth, loading } = useFinance();
  const { user } = useAuth();
  const { id: monthId } = useParams<{ id?: string }>();

  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');

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

  const monthNameToIndex: Record<string, number> = {
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
          } else {
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
        .reduce((acc: Record<string, number>, t) => {
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
        .reduce((acc: Record<string, number>, t) => {
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
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="text-center text-white">
          <svg
            className="animate-spin h-8 w-8 text-primary mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 relative">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {currentMonth} {currentYear}
          {isMonthLocked(currentMonthIndex, currentYear) && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
        </h1>

        <div className="flex flex-col items-end">
          <p className="text-sm text-gray-400">Welcome back,</p>
          <h2 className="text-lg font-medium">{user?.username || 'User'}</h2>
        </div>
      </div>

      {!isMonthLocked(currentMonthIndex, currentYear) && (
        <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-10">
          <button
            onClick={openIncomeModal}
            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
            aria-label="Add income"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={openExpenseModal}
            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            aria-label="Add expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialType={modalType}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-3 sm:mb-6">
        <StatsCard
          title="Total Income"
          value={safeSummary.totalIncome}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: 13, isPositive: true }}
        />

        <StatsCard
          title="Total Expenses"
          value={safeSummary.totalExpenses}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          trend={{ value: 8, isPositive: false }}
        />

        <StatsCard
          title="Available Balance"
          value={safeSummary.availableBalance}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          }
          trend={{ value: 5, isPositive: true }}
        />

        <StatsCard
          title="Net Worth"
          value={safeSummary.netWorth}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          trend={{ value: 7, isPositive: true }}
        />
      </div>

      <div className="card mb-3 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Income & Expenses</h2>
          <div className="bg-dark rounded-lg flex flex-wrap w-full sm:w-auto">
            <button
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'day' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('day')}
            >
              Day
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'week' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'month' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'year' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              Year
            </button>
          </div>
        </div>

        <LineChart data={lineChartData} height={300} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-3 sm:mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Income Categories</h2>
          <div className="relative">
            <PieChart data={incomeChartData} height={220} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold">${safeSummary.totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(incomeCategories).map(([category, amount], index) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: incomeChartData.datasets[0].backgroundColor[index % incomeChartData.datasets[0].backgroundColor.length] }}
                  ></span>
                  <span className="text-sm">{category}</span>
                </div>
                <span className="text-sm">${Number(amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Expense Categories</h2>
          <div className="relative">
            <PieChart data={expenseChartData} height={220} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold">${safeSummary.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 overflow-y-auto max-h-32 pr-1">
            {Object.entries(expenseCategories).map(([category, amount], index) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: expenseChartData.datasets[0].backgroundColor[index % expenseChartData.datasets[0].backgroundColor.length] }}
                  ></span>
                  <span className="text-sm">{category}</span>
                </div>
                <span className="text-sm">${Number(amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Asset Allocation</h2>
          <div className="relative">
            <PieChart data={assetsData} height={220} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold">${assetsData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {assetsData.labels.map((label, index) => (
              <div key={label} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: assetsData.datasets[0].backgroundColor[index] }}
                  ></span>
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm">${assetsData.datasets[0].data[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Latest Transactions</h2>
          <button className="text-primary hover:text-blue-700 text-sm font-medium">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3">Type</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 hidden sm:table-cell">Date</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {latestTransactions.length > 0 ? (
                latestTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-t border-gray-800">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${transaction.type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'} flex items-center justify-center mr-2`}>
                          {transaction.type === 'income' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-[200px]">
                            {transaction.description || transaction.category}
                          </span>
                          <span className="text-xs text-gray-400 sm:hidden">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 text-sm">{transaction.category}</td>
                    <td className="py-3 text-gray-400 hidden sm:table-cell">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className={`py-3 text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    No transactions yet. Add your first transaction!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isMonthLocked(currentMonthIndex, currentYear) && (
        <div className="mt-6 bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-medium text-white">Future Month Locked</h3>
          <p className="text-gray-400 mt-2">
            You cannot add transactions to future months. Please select the current month or a past month to add transactions.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;