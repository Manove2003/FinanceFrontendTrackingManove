import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Targets from './pages/Targets';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Notification from './pages/Notification';
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const token = localStorage.getItem('financeTrackerToken');
    console.log('ProtectedRoute - State:', { isAuthenticated, isLoading, token: token ? 'exists' : 'missing' });
    // Show loading spinner if checking auth with a token
    if (isLoading && token) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-dark", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" }) }));
    }
    // Redirect to login only if no token or explicitly unauthenticated
    if (!isAuthenticated && !token) {
        console.log('Redirecting to /login from:', location.pathname);
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
function App() {
    return (_jsx(AuthProvider, { children: _jsxs(FinanceProvider, { children: [_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(Signup, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "transactions", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "targets", element: _jsx(Targets, {}) }), _jsx(Route, { path: "spreadsheet", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "notifications", element: _jsx(Notification, {}) }), _jsx(Route, { path: "month/:id", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] })] }) }), _jsx(ToastContainer, { position: "top-right", autoClose: 3000, hideProgressBar: false, newestOnTop: false, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "dark" })] }) }));
}
export default App;
