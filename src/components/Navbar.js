import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../components/ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
export default function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 640);
            if (window.innerWidth >= 640) {
                setIsSearchOpen(false);
            }
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);
    const handleLogout = async () => {
        try {
            console.log('Initiating logout');
            await logout();
            console.log('Logout successful, navigating to /login');
            navigate("/login", { replace: true });
        }
        catch (error) {
            console.error("Logout failed:", error);
            navigate("/login", { replace: true });
        }
    };
    return (_jsx("header", { className: "border-b border-gray-600 bg-[#1E2A44]", children: _jsxs("div", { className: "w-full px-4 sm:px-8 py-4 flex items-center justify-between", children: [_jsx("div", { className: `${isSearchOpen && isMobile ? "hidden" : "block"}`, children: _jsxs(Link, { to: "/", className: "flex flex-col", children: [_jsx("h1", { className: "text-lg sm:text-xl font-bold text-white", children: "Finance Budget Tracker" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-400", children: "Convenient bill payment automation." })] }) }), _jsxs("div", { className: `flex items-center gap-2 ${isSearchOpen && isMobile ? "hidden" : "flex"}`, children: [_jsx(Link, { to: "/notifications", children: _jsxs(Button, { variant: "ghost", size: "icon", className: "text-white hover:text-blue-500 hover:bg-gray-700", children: [_jsx(Bell, { className: "h-4 sm:h-5 w-4 sm:w-5" }), _jsx("span", { className: "sr-only", children: "Notifications" })] }) }), isAuthenticated && user ? (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "p-0 h-8 flex items-center gap-1 text-white hover:text-blue-500 hover:bg-gray-700", children: [_jsxs(Avatar, { className: "h-6 sm:h-8 w-6 sm:w-8", children: [_jsx(AvatarImage, { src: user.avatar || "/placeholder.svg?height=32&width=32", alt: user.username }), _jsx(AvatarFallback, { className: "bg-gray-700 text-white", children: user.username ? user.username[0].toUpperCase() : "U" })] }), _jsx(ChevronDown, { className: "h-3 sm:h-4 w-3 sm:w-4 text-gray-400" })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "bg-[#1E2A44] border-gray-600 w-48 sm:w-56", children: [_jsx(DropdownMenuLabel, { className: "text-white", children: user.username || "My Account" }), _jsx(DropdownMenuSeparator, { className: "bg-gray-600" }), _jsx(DropdownMenuItem, { className: "text-gray-200 hover:bg-gray-700 hover:text-blue-500", asChild: true, children: _jsx(Link, { to: "/profile", children: "Profile" }) }), _jsx(DropdownMenuItem, { className: "text-gray-200 hover:bg-gray-700 hover:text-blue-500", asChild: true, children: _jsx(Link, { to: "/settings", children: "Settings" }) }), _jsx(DropdownMenuItem, { className: "text-gray-200 hover:bg-gray-700 hover:text-blue-500", asChild: true, children: _jsx(Link, { to: "/billing", children: "Billing" }) }), _jsx(DropdownMenuSeparator, { className: "bg-gray-600" }), _jsx(DropdownMenuItem, { className: "text-gray-200 hover:bg-gray-700 hover:text-blue-500", onClick: handleLogout, children: "Log out" })] })] })) : (_jsx(Button, { variant: "ghost", className: "text-white hover:text-blue-500 hover:bg-gray-700 text-sm sm:text-base", asChild: true, children: _jsx(Link, { to: "/login", children: "Sign In" }) }))] })] }) }));
}
