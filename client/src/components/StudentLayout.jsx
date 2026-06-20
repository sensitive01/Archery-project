import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Menu,
  X,
  Target,
  User,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../../src/assets/logo.png";
import NotificationBell from "./NotificationBell";

const StudentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
    } else if (user.needsPasswordReset && location.pathname !== "/reset-password") {
      navigate("/reset-password");
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Enrollments", path: "/myprograms", icon: Target },
    { name: "Class Schedules", path: "/myschedule", icon: Calendar },
    { name: "My Attendance", path: "/myattendance", icon: ClipboardList },
    { name: "Purchases", path: "/mypurchases", icon: ShoppingBag },
    { name: "Pay & Play", path: "/mypayandplay", icon: Target },
    { name: "Events", path: "/myevents", icon: Target },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-inter overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed inset-y-0 z-50">
        <div className="h-24 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Archery"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="font-outfit font-bold text-xl text-gray-900 tracking-tight leading-none mr-5">
                Archers <span className="text-brand-red">Portal</span>
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                    ? "text-brand-red bg-red-50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-brand-red" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Info + Logout Bottom */}
        <div className="border-t border-gray-100">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-9 h-9 bg-brand-navy rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-sm font-medium rounded-xl transition-all duration-200 text-gray-500 hover:text-brand-red hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0">
        {/* Top Header (Desktop + Mobile) */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
          {/* Left side: Mobile Logo (hidden on desktop) */}
          <div className="flex items-center lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Archery" className="h-8 w-auto" />
              <span className="font-outfit font-bold text-lg text-gray-900 hidden sm:block">
                ARCHERY<span className="text-brand-red">PRO</span>
              </span>
            </Link>
          </div>
          
          {/* Left side: Desktop title (hidden on mobile) */}
          <div className="hidden lg:block">
             <h2 className="text-xl font-bold text-gray-800">Student Dashboard</h2>
          </div>

          {/* Right side: Bell & Mobile Menu */}
          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell />
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none p-2"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col shadow-2xl">
              <div className="h-20 flex items-center px-6 border-b border-gray-100">
                <Link
                  to="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3"
                >
                  <img src={logo} alt="Archery" className="h-9 w-auto" />
                  <div>
                    <h1 className="font-outfit font-bold text-xl text-gray-900 tracking-tight leading-none">
                      ARCHERY<span className="text-brand-red">PRO</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                      Student Portal
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
                          ? "text-brand-red bg-red-50"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "text-brand-red" : "text-gray-400"}`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-gray-100">
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="w-9 h-9 bg-brand-navy rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {user?.firstName?.charAt(0) || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 w-full text-sm font-medium rounded-xl transition-all duration-200 text-gray-500 hover:text-brand-red hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
