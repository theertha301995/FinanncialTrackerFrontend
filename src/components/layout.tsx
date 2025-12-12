// ========================================
// FILE: src/components/Layout.tsx
// Main Layout with Sidebar Navigation & Mobile Menu
// ========================================
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { getUnreadCount } from '../features/notification/notificationSlice';
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Bell, 
  LogOut, 
  Wallet, 
  Menu, 
  X,
  ChevronDown,
  Settings,
  HelpCircle,
  MessageSquareMore
} from 'lucide-react';

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);


  useEffect(() => {
  dispatch(getUnreadCount());
  
  // Poll every 10 seconds for new notifications
  const interval = setInterval(() => {
    dispatch(getUnreadCount());
  }, 10000);
  
  return () => clearInterval(interval);
}, [dispatch]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items
  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Overview & stats'
    },
    { 
      path: '/expenses', 
      icon: DollarSign, 
      label: 'Expenses',
      description: 'Track spending'
    },
    { 
      path: '/budget', 
      icon: TrendingUp, 
      label: 'Budget',
      description: 'Set limits'
    },
    { 
      path: '/family', 
      icon: Users, 
      label: 'Family',
      description: 'Members & total'
    },
    { 
      path: '/chat', 
      icon: MessageSquareMore, 
      label: 'Chat',
      description: 'Chat with us'
    },
    { 
      path: '/notifications', 
      icon: Bell, 
      label: 'Notifications',
      description: 'Latest updates',
      badge: unreadCount 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================================
          MOBILE HEADER
          ======================================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">ExpenseTracker</h1>
              <p className="text-xs text-gray-600">{user?.name}</p>
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================
          MOBILE OVERLAY
          ======================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================
          SIDEBAR
          ======================================== */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* ========== LOGO SECTION ========== */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ExpenseTracker</h1>
                <p className="text-xs text-gray-500">Family Budget Manager</p>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                      {user?.role === 'head' ? '👑 Family Head' : '👤 Member'}
                    </span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-gray-600 transition-transform ${profileDropdown ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========== NAVIGATION MENU ========== */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        active 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          active
                            ? 'bg-white text-purple-600'
                            : 'bg-red-500 text-white animate-pulse'
                        }`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ========== FOOTER SECTION ========== */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-2">
              <div className="flex items-center justify-between text-xs">
                
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all duration-200 w-full group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
                <LogOut size={20} />
              </div>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================
          MAIN CONTENT AREA
          ======================================== */}
      <div className="lg:ml-72 min-h-screen">
        {/* Content Wrapper */}
        <main className="pt-20 lg:pt-0 px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Content */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Wallet className="text-white" size={16} />
                </div>
                <span className="text-sm text-gray-600">
                  © 2024 ExpenseTracker. All rights reserved.
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <a href="#" className="hover:text-blue-600 transition">Privacy</a>
                <a href="#" className="hover:text-blue-600 transition">Terms</a>
                <a href="#" className="hover:text-blue-600 transition">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;