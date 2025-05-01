import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const { transactions, summary, currentMonth, currentYear } = useFinance();
    const { user, logout, uploadAvatar } = useAuth();
    // Add local state for balance to ensure updates
    const [availableBalance, setAvailableBalance] = useState(summary.availableBalance);
    // Update balance whenever transactions or summary changes
    useEffect(() => {
        console.log('Summary updated in Header:', summary);
        console.log('Current month and year:', currentMonth, currentYear);
        // Update local balance state when summary changes
        setAvailableBalance(summary.availableBalance);
    }, [summary, transactions, currentMonth, currentYear]);
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        }
        catch (err) {
            console.error('Logout error:', err);
        }
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const handleAvatarClick = (e) => {
        e.stopPropagation();
        setShowUploadMenu(!showUploadMenu);
    };
    const handleFileUpload = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                await uploadAvatar(file);
                setShowUploadMenu(false);
            }
            catch (error) {
                console.error('Error uploading avatar:', error);
            }
        }
    };
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
        setShowUploadMenu(false);
    };
    // Helper to handle avatar display
    const renderAvatar = () => {
        if (user?.avatar) {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://finance-tracker-backend-production-1cb3.up.railway.app/api';
            // const baseUrl = 'http://localhost:5000/api'; // Fallback to local URL if not set
            const avatarUrl = user.avatar.startsWith('http') ? user.avatar : `${baseUrl}${user.avatar}`;
            return (_jsx("img", { src: avatarUrl, alt: user.username, className: "w-full h-full object-cover rounded-full" }));
        }
        return (_jsx("div", { className: "w-full h-full flex items-center justify-center text-white font-bold", children: user?.username?.[0]?.toUpperCase() || 'U' }));
    };
    // Close upload menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowUploadMenu(false);
        };
        if (showUploadMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showUploadMenu]);
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { path: '/transactions', label: 'Transactions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { path: '/targets', label: 'Targets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ];
    return (_jsxs("header", { className: "flex flex-col lg:flex-row justify-between items-center p-4 bg-dark border-b border-gray-800 relative", children: [_jsx("input", { type: "file", ref: fileInputRef, className: "hidden", accept: "image/*", onChange: handleFileUpload }), _jsxs("div", { className: "lg:hidden w-full text-center mb-4", children: [_jsx("h1", { className: "text-lg font-semibold text-text/light", children: "Personal Finance Tracker" }), _jsxs("div", { className: "mt-2", children: [_jsx("h2", { className: "text-sm text-text/muted", children: "Available Balance" }), _jsxs("p", { className: "text-xl font-bold text-secondary", children: ["$", availableBalance.toLocaleString()] })] })] }), _jsxs("div", { className: "hidden lg:flex flex-col items-start w-full lg:w-auto mb-4 lg:mb-0", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-sm text-text/muted", children: "Personal Finance Tracker" }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold text-text/light mt-1", children: "Available Balance" }), _jsxs("p", { className: "text-2xl sm:text-3xl font-bold text-secondary mt-1", children: ["$", availableBalance.toLocaleString()] })] }), _jsx("nav", { className: "hidden lg:flex bg-dark.light rounded-lg mt-4", children: navItems.map((item) => (_jsx(Link, { to: item.path, className: `nav-item px-6 py-3 ${currentPath === item.path ? 'bg-dark bg-opacity-60' : ''}`, children: _jsxs("span", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: item.icon }) }), item.label] }) }, item.path))) })] }), _jsxs("div", { className: "lg:hidden fixed right-4 top-4 z-20", children: [_jsx("div", { onClick: toggleSidebar, className: "w-10 h-10 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full overflow-hidden cursor-pointer", children: renderAvatar() }), _jsx("div", { className: `fixed top-0 right-0 h-full w-64 bg-dark.light transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} z-30`, children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full overflow-hidden cursor-pointer", onClick: handleAvatarClick, children: renderAvatar() }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-text/light", children: user?.username || 'User' }), _jsx("p", { className: "text-sm text-text/muted", children: user?.email || 'user@example.com' }), _jsx("button", { className: "mt-1 text-xs text-blue-400 hover:text-blue-300", onClick: triggerFileInput, children: "Change profile picture" })] })] }), _jsx("nav", { className: "flex flex-col space-y-2 mb-4", children: navItems.map((item) => (_jsx(Link, { to: item.path, onClick: toggleSidebar, className: `px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white rounded-md ${currentPath === item.path ? 'bg-dark bg-opacity-60' : ''}`, children: _jsxs("span", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: item.icon }) }), item.label] }) }, item.path))) }), _jsx("button", { onClick: handleLogout, className: "w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white rounded-md", children: "Sign out" })] }) }), isSidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-20", onClick: toggleSidebar }))] }), _jsx("div", { className: "hidden lg:flex items-center absolute top-4 right-4 space-x-3", children: _jsxs("div", { className: "relative group flex flex-col items-center", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-white font-bold ml-auto", onClick: handleAvatarClick, children: renderAvatar() }), _jsxs("div", { className: "mt-2 text-right", children: [_jsx("h3", { className: "font-medium text-text/light text-sm", children: user?.username || 'User' }), _jsx("p", { className: "text-xs text-text/muted", children: user?.email || 'user@example.com' })] }), _jsxs("div", { className: `absolute top-full right-0 mt-2 w-48 bg-dark.light rounded-md shadow-lg py-1 z-10 ${showUploadMenu ? 'block' : 'hidden'}`, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: triggerFileInput, className: "w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white", children: "Change profile picture" }), _jsx("button", { onClick: handleLogout, className: "w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white", children: "Sign out" })] })] }) })] }));
};
export default Header;
