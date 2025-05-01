import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFinance } from '../contexts/FinanceContext';
const MonthSelector = () => {
    const { currentMonth, currentYear, setMonth, isMonthLocked } = useFinance();
    // All months of the year
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Current date for comparison
    // const now = new Date(); // Commenting out unused variable
    const currentMonthIndex = months.indexOf(currentMonth);
    // Previous and next month
    const handlePreviousMonth = () => {
        let newMonth = currentMonthIndex - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setMonth(newMonth, newYear);
    };
    const handleNextMonth = () => {
        let newMonth = currentMonthIndex + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        // Only allow navigation to future months if they're not locked
        if (!isMonthLocked(newMonth, newYear)) {
            setMonth(newMonth, newYear);
        }
    };
    // Check if next month is locked
    const isNextMonthLocked = () => {
        let nextMonth = currentMonthIndex + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }
        return isMonthLocked(nextMonth, nextYear);
    };
    return (_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("button", { onClick: handlePreviousMonth, className: "p-2 rounded-full hover:bg-dark.light focus:outline-none", title: "Previous Month", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-xl font-medium", children: currentMonth }), _jsx("p", { className: "text-sm text-gray-400", children: currentYear })] }), _jsx("button", { onClick: handleNextMonth, className: `p-2 rounded-full focus:outline-none ${isNextMonthLocked() ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-dark.light'}`, title: isNextMonthLocked() ? "Future months are locked" : "Next Month", disabled: isNextMonthLocked(), children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }));
};
export default MonthSelector;
