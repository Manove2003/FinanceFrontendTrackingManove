import React, { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { useAuth } from "../contexts/AuthContext";
import { Progress } from "../components/ui/progress";
import { Target, IncomeCategories, ExpenseCategories } from "../types";

const Targets: React.FC = () => {
  const { targets, addTarget, updateTarget, deleteTarget} = useFinance();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [newTarget, setNewTarget] = useState({
    category: "Salary",
    type: "income" as "income" | "expense",
    targetAmount: "",
  });

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 text-center">
        <p className="text-gray-400">Please log in to create or view targets.</p>
      </div>
    );
  }

  // Calculate progress percentage
  const calculateProgress = (target: Target) => {
    try {
      const currentAmount = Number(target.currentAmount);
      const targetAmount = Number(target.targetAmount);
      if (isNaN(targetAmount) || targetAmount <= 0) return 0;
      const progress = (currentAmount / targetAmount) * 100;
      return Math.min(Math.max(progress, 0), 100);
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  };

  // Determine target status
  const getTargetStatus = (target: Target) => {
    const progress = calculateProgress(target);
    const isIncomeTarget = target.type === "income";

    if (progress >= 100) {
      return {
        label: isIncomeTarget ? "Achieved" : "Exceeded",
        color: isIncomeTarget ? "text-green-500" : "text-red-500",
        bgColor: isIncomeTarget ? "bg-green-500" : "bg-red-500",
      };
    } else if (progress >= 80) {
      return {
        label: isIncomeTarget ? "Almost There" : "Warning",
        color: isIncomeTarget ? "text-blue-500" : "text-orange-500",
        bgColor: isIncomeTarget ? "bg-blue-500" : "bg-orange-500",
      };
    } else {
      return {
        label: isIncomeTarget ? "In Progress" : "Good",
        color: isIncomeTarget ? "text-blue-400" : "text-green-500",
        bgColor: isIncomeTarget ? "bg-blue-400" : "bg-green-500",
      };
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTarget((prev) => ({
      ...prev,
      [name]: name === "targetAmount" ? value.replace(/[^0-9.]/g, "") : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetAmount = parseFloat(newTarget.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (!['income', 'expense'].includes(newTarget.type)) {
      alert("Invalid target type");
      return;
    }

    if (!Object.keys(newTarget.type === 'income' ? IncomeCategories : ExpenseCategories).includes(newTarget.category)) {
      alert("Invalid category");
      return;
    }

    const targetData = {
      ...newTarget,
      targetAmount,
    };

    try {
      if (editingTarget) {
        await updateTarget(editingTarget.id, targetData);
      } else {
        await addTarget(targetData);
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting target:", err);
      alert("Failed to add or update target");
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTarget({
      category: "Salary",
      type: "income",
      targetAmount: "",
    });
    setShowForm(false);
    setEditingTarget(null);
  };

  // Open form for adding a new target
  const openAddTargetForm = () => {
    setEditingTarget(null);
    resetForm();
    setShowForm(true);
  };

  // Edit an existing target
  const handleEdit = (target: Target) => {
    setEditingTarget(target);
    setNewTarget({
      category: target.category,
      type: target.type,
      targetAmount: target.targetAmount.toString(),
    });
    setShowForm(true);
  };

  // Filter valid targets
  const validTargets = targets.filter(
    (target) => target.targetAmount > 0 && ["income", "expense"].includes(target.type)
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Financial Targets</h1>
        <button
          className="btn btn-primary w-full sm:w-auto"
          onClick={showForm ? resetForm : openAddTargetForm}
        >
          {showForm ? "Cancel" : "Add Target"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingTarget ? "Edit Target" : "Add New Target"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Type
                </label>
                <select
                  name="type"
                  value={newTarget.type}
                  onChange={handleInputChange}
                  className="input bg-gray-700 text-white border border-gray-600 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={newTarget.category}
                  onChange={handleInputChange}
                  className="input bg-gray-700 text-white border border-gray-600 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {newTarget.type === "income"
                    ? Object.keys(IncomeCategories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                    : Object.keys(ExpenseCategories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Amount ($)
                </label>
                <input
                  type="text"
                  name="targetAmount"
                  value={newTarget.targetAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="input bg-gray-700 text-white border border-gray-600 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn bg-gray-600 text-white hover:bg-gray-500 px-4 py-2 rounded-md"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-md"
              >
                {editingTarget ? "Update Target" : "Add Target"}
              </button>
            </div>
          </form>
        </div>
      )}

      {validTargets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {validTargets.map((target) => {
            const currentValue = target.currentAmount;
            const progress = calculateProgress(target);
            const status = getTargetStatus(target);

            return (
              <div key={target.id} className="card bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        target.type === "income"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {target.type === "income" ? `Income: ${target.category}` : `Expense: ${target.category}`}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      Target: ${Number(target.targetAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(target)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTarget(target.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Progress ({progress.toFixed(1)}%)
                    </span>
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <Progress
  value={progress}
  className={`h-2 bg-gray-700 ${status.bgColor}`}
/>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-400">Current</span>
                    <p
                      className={`font-semibold text-base ${
                        target.type === "income"
                          ? "text-green-500"
                          : currentValue > target.targetAmount
                          ? "text-red-500"
                          : "text-white"
                      }`}
                    >
                      ${Number(currentValue).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">Remaining</span>
                    <p className="font-semibold text-base">
                      ${Number(Math.max(target.targetAmount - currentValue, 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center p-8 bg-gray-800 rounded-lg">
          <div className="flex justify-center mb-4">
            <div
              className="bg-gray-700 p-3 rounded-full cursor-pointer"
              onClick={openAddTargetForm}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No targets set</h3>
          <p className="text-gray-400 mb-4">
            Set financial targets to track your progress.
          </p>
          <button
            className="btn btn-primary px-4 py-2 rounded-md"
            onClick={openAddTargetForm}
          >
            Create Your First Target
          </button>
        </div>
      )}
    </div>
  );
};

export default Targets;