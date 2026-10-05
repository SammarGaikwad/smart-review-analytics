import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, User as UserIcon, LogOut, Settings, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  isBackendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, isBackendOnline = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive page title from path
  const getPageTitle = (pathname: string): { title: string; breadcrumb: string } => {
    switch (pathname) {
      case '/':
        return { title: 'Dashboard', breadcrumb: 'Overview & Key Metrics' };
      case '/reviews':
        return { title: 'Review Management', breadcrumb: 'Reviews / Management' };
      case '/analytics':
        return { title: 'Analytics Engine & Network', breadcrumb: 'ASTMA / Analytics Modules' };
      case '/domains':
        return { title: 'Domain Management', breadcrumb: 'System / Domains' };
      case '/products':
        return { title: 'Product Catalog', breadcrumb: 'Inventory / Products' };
      case '/reports':
        return { title: 'Reports & Intelligence', breadcrumb: 'Analytics / Reports' };
      case '/users':
        return { title: 'User Access Control (RBAC)', breadcrumb: 'Enterprise Systems / Users' };
      case '/audit-logs':
        return { title: 'Audit Trail Logs', breadcrumb: 'Enterprise Systems / Audit' };
      case '/system':
        return { title: 'System Health & DevOps', breadcrumb: 'IPTM & Architecture Status' };
      case '/settings':
        return { title: 'Platform Settings', breadcrumb: 'System / Settings' };
      default:
        if (pathname.startsWith('/reviews/')) {
          return { title: 'Review Analysis & Details', breadcrumb: 'Reviews / Details' };
        }
        return { title: 'Smart Review Analytics', breadcrumb: 'Platform' };
    }
  };

  const { title, breadcrumb } = getPageTitle(location.pathname);

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const primaryRole = user?.roles?.[0] || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left Section: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="text-[11px] font-medium text-slate-400">
              {breadcrumb}
            </div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section: System Health, Notifications, User Profile */}
        <div className="flex items-center space-x-4">
          
          {/* System Health Indicator */}
          <Link
            to="/system"
            className={`hidden sm:inline-flex items-center space-x-2 px-3 py-1 border rounded-full text-xs font-semibold transition ${
              isBackendOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80'
                : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/80'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isBackendOnline ? 'Backend Online' : 'Backend Offline'}</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    2 Active
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs text-slate-600">
                  <div className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer">
                    <p className="font-semibold text-slate-800">REST API Synced</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Real data active across ASTMA, ES & IPTM.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer">
                    <p className="font-semibold text-slate-800">JWT Identity Active</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Logged in as {user?.email}.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Session active</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2.5 p-1 hover:bg-slate-100 rounded-lg transition text-left"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {primaryRole}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user?.roles?.map((r) => (
                      <span
                        key={r}
                        className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="py-1 text-xs text-slate-700">
                  {user?.roles?.includes('Admin') && (
                    <>
                      <Link
                        to="/users"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>User Management</span>
                      </Link>
                      <Link
                        to="/audit-logs"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Audit Trail Logs</span>
                      </Link>
                    </>
                  )}
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-rose-50 text-rose-600 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
