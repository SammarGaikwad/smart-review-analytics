import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Globe,
  Package,
  FileText,
  Users,
  ShieldAlert,
  Server,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { roles } = useAuth();
  const isAdmin = roles.includes('Admin');
  const isAnalyst = roles.includes('Analyst');
  const isBusinessUser = roles.includes('BusinessUser');

  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, allowed: true },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare, allowed: true },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, allowed: isAdmin || isAnalyst },
    { name: 'Domains', path: '/domains', icon: Globe, allowed: isAdmin || isAnalyst || isBusinessUser },
    { name: 'Products', path: '/products', icon: Package, allowed: isAdmin || isAnalyst || isBusinessUser },
    { name: 'Reports', path: '/reports', icon: FileText, allowed: isAdmin || isAnalyst || isBusinessUser },
    { name: 'Users', path: '/users', icon: Users, allowed: isAdmin },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, allowed: isAdmin },
  ].filter((item) => item.allowed);

  const bottomNavItems = [
    { name: 'System', path: '/system', icon: Server, allowed: isAdmin || isAnalyst },
    { name: 'Settings', path: '/settings', icon: Settings, allowed: true },
  ].filter((item) => item.allowed);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-slate-800`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <NavLink to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide block leading-tight">
              Smart Review
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
              Analytics Platform
            </span>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Academic Integrated Pill */}
        <div className="px-3 py-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Integrated Project</span>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">ASTMA</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-medium">IPTM</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">ES</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-1">
        <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          System Management
        </div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
