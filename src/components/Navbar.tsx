import { useState, useEffect } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
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
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="border-b border-gray-600 bg-[#1E2A44]">
      <div className="w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className={`${isSearchOpen && isMobile ? "hidden" : "block"}`}>
          <Link to="/" className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold text-white">Finance Budget Tracker</h1>
            <p className="text-xs sm:text-sm text-gray-400">Convenient bill payment automation.</p>
          </Link>
        </div>

        <div className={`flex items-center gap-2 ${isSearchOpen && isMobile ? "hidden" : "flex"}`}>
          <Link to="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-blue-500 hover:bg-gray-700"
          >
            <Bell className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-8 flex items-center gap-1 text-white hover:text-blue-500 hover:bg-gray-700"
                >
                  <Avatar className="h-6 sm:h-8 w-6 sm:w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32"} alt={user.username} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {user.username ? user.username[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1E2A44] border-gray-600 w-48 sm:w-56">
                <DropdownMenuLabel className="text-white">
                  {user.username || "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem
                  className="text-gray-200 hover:bg-gray-700 hover:text-blue-500"
                  asChild
                >
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-200 hover:bg-gray-700 hover:text-blue-500"
                  asChild
                >
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-200 hover:bg-gray-700 hover:text-blue-500"
                  asChild
                >
                  <Link to="/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem
                  className="text-gray-200 hover:bg-gray-700 hover:text-blue-500"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="text-white hover:text-blue-500 hover:bg-gray-700 text-sm sm:text-base"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}