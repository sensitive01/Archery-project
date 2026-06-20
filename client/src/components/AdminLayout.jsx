import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  UserCog,
  LogOut,
  Target,
  Menu,
  X,
  Image as ImageIcon,
  Box,
  ClipboardCheck,
  ShoppingCart,
  CreditCard,
  Star,
  Camera,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
// images import removed
import logo from "../../src/assets/newLogo.png";
import NotificationBell from "./NotificationBell";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Members", path: "/admin/members", icon: Users },
    { name: "Course", path: "/admin/courses", icon: BookOpen },
    { name: "Batch", path: "/admin/batches", icon: Calendar },
    { name: "Coach", path: "/admin/coaches", icon: UserCog },
    { name: "Banners", path: "/admin/banners", icon: ImageIcon },
    { name: "Attendance", path: "/admin/attendance", icon: ClipboardCheck },
    { name: "Products", path: "/admin/equipment", icon: Box },
    { name: "Purchases", path: "/admin/purchases", icon: ShoppingCart },
    { name: "Transactions", path: "/admin/transactions", icon: CreditCard },
    { name: "Pay & Play", path: "/admin/payandplay", icon: Target },
    { name: "Events", path: "/admin/events", icon: Star },
    { name: "Gallery", path: "/admin/gallery", icon: Camera },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-brand-navy flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={logo}
              alt="Archery Admin"
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="font-outfit font-bold text-xl text-white tracking-tight leading-none mr-5">
                Admin <span className="text-brand-red">Portal</span>
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white bg-brand-red/10 border-r-4 border-brand-red"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-brand-red" : ""}`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="flex-1 flex justify-end items-center">
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-brand-blue font-medium uppercase tracking-wider">
                  Admin
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 bg-brand-navy flex flex-col">
              <div className="h-20 flex items-center px-6 border-b border-gray-800">
                <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <img
                    src={logo}
                    alt="Archery Admin"
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <h1 className="font-outfit font-bold text-xl text-white tracking-tight leading-none mr-5">
                      Admin <span className="text-brand-red">Portal</span>
                    </h1>
                  </div>
                </Link>
              </div>
              <div className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-white bg-brand-red/10 border-r-4 border-brand-red"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "text-brand-red" : ""}`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
