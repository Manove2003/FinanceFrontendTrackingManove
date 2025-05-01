import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import MonthSelector from './MonthSelector';
import { ChevronDown, PanelRight, LayoutDashboard, Target, CreditCard, PieChart, LineChart, Wallet, BadgeDollarSign } from 'lucide-react';
// Month abbreviations
const monthsAbbr = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
// Map full month names to their indices
const monthNameToIndex = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
};
const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { currentMonth, currentYear, isMonthLocked, setMonth, summary } = useFinance();
    const currentMonthIndex = monthNameToIndex[currentMonth];
    const availableMonths = monthsAbbr.map((month, index) => {
        const isLocked = isMonthLocked(index, currentYear);
        return {
            name: month,
            index,
            isLocked
        };
    });
    const handleMonthSelect = (monthIndex) => {
        if (!isMonthLocked(monthIndex, currentYear)) {
            setMonth(monthIndex, currentYear);
            if (isMobile)
                setIsSidebarOpen(false);
        }
    };
    const navItems = [
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
        { path: "/targets", name: "Targets", icon: Target },
        { path: "/transactions", name: "Transactions", icon: CreditCard },
        { path: "/budget", name: "Budget", icon: PieChart },
        { path: "/insights", name: "Insights", icon: LineChart },
        { path: "/goals", name: "Goals", icon: Wallet },
    ];
    useEffect(() => {
        let timeout;
        const checkScreenSize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const mobile = window.innerWidth < 768;
                setIsMobile(mobile);
                setIsSidebarOpen((prev) => (mobile ? prev : true));
            }, 100);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };
    // Safeguard summary values with fallback to 0
    const safeSummary = {
        totalIncome: Number(summary?.totalIncome) || 0,
        totalExpenses: Number(summary?.totalExpenses) || 0,
        availableBalance: Number(summary?.availableBalance) || 0,
    };
    return (_jsxs(_Fragment, { children: [_jsx("aside", { className: `
          flex-shrink-0
          bg-[#1E2A44] text-white h-screen border-r border-gray-600 transition-[width,min-width] duration-300
          ${isMobile
                    ? isSidebarOpen
                        ? 'fixed inset-y-0 left-0 w-64 min-w-64 z-40'
                        : 'hidden'
                    : isSidebarOpen
                        ? 'block w-64 min-w-64'
                        : 'block w-16 min-w-16'}
        `, children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "p-4 border-b border-gray-600", children: [(isSidebarOpen || isMobile) && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BadgeDollarSign, { strokeWidth: 1 }), isSidebarOpen && _jsx("span", { className: "font-semibold", children: "Savi" })] }), _jsx("button", { className: "p-2 rounded-md hover:bg-gray-700 hover:text-blue-500", onClick: toggleSidebar, children: _jsx(PanelRight, { className: "h-5 w-5 text-gray-400" }) })] })), (!isSidebarOpen && !isMobile) && (_jsx("div", { className: "flex justify-center", children: _jsx("button", { className: "flex items-center rounded-md hover:bg-gray-700 hover:text-blue-500 justify-center w-full", onClick: toggleSidebar, children: _jsx(PanelRight, { className: "h-5 w-5 text-gray-400" }) }) }))] }), (isSidebarOpen || isMobile) && (_jsx("div", { className: "p-4 border-b border-gray-600", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3", children: _jsx("span", { className: "text-xs", children: "\uD83D\uDC64" }) }), isSidebarOpen && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-white", children: "Personal account" }), _jsx("p", { className: "text-xs text-gray-400", children: "Free Trial" })] }))] }), isSidebarOpen && _jsx(ChevronDown, { size: 16, className: "text-gray-400" })] }) })), _jsxs("div", { className: "flex-1 overflow-y-auto", children: [_jsx("nav", { className: "p-2", children: _jsx("ul", { className: "space-y-1", children: navItems.map((item, index) => (_jsx("li", { children: _jsxs("a", { className: `
              flex items-center px-3 py-2 text-sm rounded-md
              hover:bg-gray-700 hover:text-blue-500
              ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}
            `, href: item.path, children: [_jsx(item.icon, { className: 'h-5 w-5 text-gray-400' }), (isSidebarOpen || isMobile) && _jsx("span", { className: "ml-3", children: item.name })] }) }, index))) }) }), (isSidebarOpen || isMobile) && (_jsxs("div", { className: "p-4 border-t border-gray-600", children: [_jsx(MonthSelector, {}), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Income" }), _jsxs("p", { className: "text-lg font-medium text-green-500", children: ["$", safeSummary.totalIncome.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Expenses" }), _jsxs("p", { className: "text-lg font-medium text-red-500", children: ["$", safeSummary.totalExpenses.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Balance" }), _jsxs("p", { className: "text-lg font-medium text-blue-500", children: ["$", safeSummary.availableBalance.toLocaleString()] })] })] })] })), (isSidebarOpen || isMobile) && (_jsxs("div", { className: "p-4 border-t border-gray-600", children: [_jsx("h2", { className: "text-sm font-medium text-gray-400 mb-3 uppercase", children: "Months" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: availableMonths.map((month) => (_jsxs("button", { onClick: () => handleMonthSelect(month.index), disabled: month.isLocked, className: `
                        py-2 px-3 rounded text-center text-sm
                        ${month.index === currentMonthIndex
                                                    ? 'bg-blue-500 text-white'
                                                    : month.isLocked
                                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-blue-500'}
                      `, children: [month.name, month.isLocked && (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3 ml-1 inline", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }))] }, month.name))) })] })), (isSidebarOpen || isMobile) && (_jsxs("div", { className: "p-4 border-t border-gray-600", children: [_jsxs("h2", { className: "text-sm font-medium text-gray-400 mb-3 uppercase", children: ["Year Summary - ", currentYear] }), _jsxs("div", { className: "bg-gray-700 p-3 rounded", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-gray-400", children: "Net Income" }), _jsx("span", { className: "text-sm font-medium text-white", children: "$21,458" })] }), _jsx("div", { className: "w-full bg-gray-600 h-1 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full", style: { width: '65%' } }) }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "65% of yearly target" })] })] }))] })] }) }), isMobile && isSidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-30", onClick: () => setIsSidebarOpen(false) }))] }));
};
export default Sidebar;
