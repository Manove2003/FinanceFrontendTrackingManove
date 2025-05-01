import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { useAuth } from "../contexts/AuthContext";
import { Progress } from "../components/ui/progress";
import { IncomeCategories, ExpenseCategories } from "../types";
const Targets = () => {
    const { targets, addTarget, updateTarget, deleteTarget } = useFinance();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [newTarget, setNewTarget] = useState({
        category: "Salary",
        type: "income",
        targetAmount: "",
    });
    // Check if user is logged in
    if (!user) {
        return (_jsx("div", { className: "flex-1 overflow-y-auto p-3 sm:p-6 text-center", children: _jsx("p", { className: "text-gray-400", children: "Please log in to create or view targets." }) }));
    }
    // Calculate progress percentage
    const calculateProgress = (target) => {
        try {
            const currentAmount = Number(target.currentAmount);
            const targetAmount = Number(target.targetAmount);
            if (isNaN(targetAmount) || targetAmount <= 0)
                return 0;
            const progress = (currentAmount / targetAmount) * 100;
            return Math.min(Math.max(progress, 0), 100);
        }
        catch (error) {
            console.error("Error calculating progress:", error);
            return 0;
        }
    };
    // Determine target status
    const getTargetStatus = (target) => {
        const progress = calculateProgress(target);
        const isIncomeTarget = target.type === "income";
        if (progress >= 100) {
            return {
                label: isIncomeTarget ? "Achieved" : "Exceeded",
                color: isIncomeTarget ? "text-green-500" : "text-red-500",
                bgColor: isIncomeTarget ? "bg-green-500" : "bg-red-500",
            };
        }
        else if (progress >= 80) {
            return {
                label: isIncomeTarget ? "Almost There" : "Warning",
                color: isIncomeTarget ? "text-blue-500" : "text-orange-500",
                bgColor: isIncomeTarget ? "bg-blue-500" : "bg-orange-500",
            };
        }
        else {
            return {
                label: isIncomeTarget ? "In Progress" : "Good",
                color: isIncomeTarget ? "text-blue-400" : "text-green-500",
                bgColor: isIncomeTarget ? "bg-blue-400" : "bg-green-500",
            };
        }
    };
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTarget((prev) => ({
            ...prev,
            [name]: name === "targetAmount" ? value.replace(/[^0-9.]/g, "") : value,
        }));
    };
    // Handle form submission
    const handleSubmit = async (e) => {
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
            }
            else {
                await addTarget(targetData);
            }
            resetForm();
        }
        catch (err) {
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
    const handleEdit = (target) => {
        setEditingTarget(target);
        setNewTarget({
            category: target.category,
            type: target.type,
            targetAmount: target.targetAmount.toString(),
        });
        setShowForm(true);
    };
    // Filter valid targets
    const validTargets = targets.filter((target) => target.targetAmount > 0 && ["income", "expense"].includes(target.type));
    return (_jsxs("div", { className: "flex-1 overflow-y-auto p-3 sm:p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4 sm:mb-0", children: "Financial Targets" }), _jsx("button", { className: "btn btn-primary w-full sm:w-auto", onClick: showForm ? resetForm : openAddTargetForm, children: showForm ? "Cancel" : "Add Target" })] }), showForm && (_jsxs("div", { className: "card mb-6 bg-gray-800 p-6 rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: editingTarget ? "Edit Target" : "Add New Target" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: "Target Type" }), _jsxs("select", { name: "type", value: newTarget.type, onChange: handleInputChange, className: "input bg-gray-700 text-white border border-gray-600 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "income", children: "Income" }), _jsx("option", { value: "expense", children: "Expense" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: "Category" }), _jsx("select", { name: "category", value: newTarget.category, onChange: handleInputChange, className: "input bg-gray-700 text-white border border-gray-600 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: newTarget.type === "income"
                                                    ? Object.keys(IncomeCategories).map((category) => (_jsx("option", { value: category, children: category }, category)))
                                                    : Object.keys(ExpenseCategories).map((category) => (_jsx("option", { value: category, children: category }, category))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: "Target Amount ($)" }), _jsx("input", { type: "text", name: "targetAmount", value: newTarget.targetAmount, onChange: handleInputChange, placeholder: "0.00", className: "input bg-gray-700 text-white border border-gray-600 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { type: "button", className: "btn bg-gray-600 text-white hover:bg-gray-500 px-4 py-2 rounded-md", onClick: resetForm, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-primary px-4 py-2 rounded-md", children: editingTarget ? "Update Target" : "Add Target" })] })] })] })), validTargets.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: validTargets.map((target) => {
                    const currentValue = target.currentAmount;
                    const progress = calculateProgress(target);
                    const status = getTargetStatus(target);
                    return (_jsxs("div", { className: "card bg-gray-800 p-4 rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${target.type === "income"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"}`, children: target.type === "income" ? `Income: ${target.category}` : `Expense: ${target.category}` }), _jsxs("p", { className: "text-sm text-gray-400 mt-2", children: ["Target: $", Number(target.targetAmount).toLocaleString()] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleEdit(target), className: "text-gray-400 hover:text-blue-500", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }), _jsx("button", { onClick: () => deleteTarget(target.id), className: "text-gray-400 hover:text-red-500", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsxs("span", { className: "text-sm font-medium", children: ["Progress (", progress.toFixed(1), "%)"] }), _jsx("span", { className: `text-sm font-medium ${status.color}`, children: status.label })] }), _jsx(Progress, { value: progress, className: `h-2 bg-gray-700 ${status.bgColor}` })] }), _jsxs("div", { className: "mt-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-400", children: "Current" }), _jsxs("p", { className: `font-semibold text-base ${target.type === "income"
                                                    ? "text-green-500"
                                                    : currentValue > target.targetAmount
                                                        ? "text-red-500"
                                                        : "text-white"}`, children: ["$", Number(currentValue).toLocaleString()] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-sm text-gray-400", children: "Remaining" }), _jsxs("p", { className: "font-semibold text-base", children: ["$", Number(Math.max(target.targetAmount - currentValue, 0)).toLocaleString()] })] })] })] }, target.id));
                }) })) : (_jsxs("div", { className: "card text-center p-8 bg-gray-800 rounded-lg", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "bg-gray-700 p-3 rounded-full cursor-pointer", onClick: openAddTargetForm, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }) }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No targets set" }), _jsx("p", { className: "text-gray-400 mb-4", children: "Set financial targets to track your progress." }), _jsx("button", { className: "btn btn-primary px-4 py-2 rounded-md", onClick: openAddTargetForm, children: "Create Your First Target" })] }))] }));
};
export default Targets;
