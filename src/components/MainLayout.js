import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import SidebarComponent from './Sidebar';
import Navbar from './Navbar';
import Balance from './Balance';
const MainLayout = () => {
    return (_jsxs("div", { className: "flex h-screen bg-dark text-text-light font-poppins", children: [_jsx(SidebarComponent, {}), _jsxs("div", { className: "flex flex-col flex-1 ", children: [_jsx(Navbar, {}), _jsx(Balance, {}), _jsx("main", { className: "flex-1 overflow-auto", children: _jsx(Outlet, {}) })] })] }));
};
export default MainLayout;
