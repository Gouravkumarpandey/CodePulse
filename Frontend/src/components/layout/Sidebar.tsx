import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogOut, ChevronRight, ChevronLeft, LayoutDashboard,
  Users, Settings, Shield, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  role: 'user' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = role === 'admin';

  const userLinks = [
    { href: '/repo-selection', icon: Activity, label: 'Integration' },
    { href: '/user', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/user/activity', icon: Activity, label: 'Activity Log' },
    { href: '/user/warnings', icon: Shield, label: 'Alerts' },
    { href: '/user/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Players' },
    { href: '/admin/settings', icon: Settings, label: 'World Rules' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  if (!isAdmin) {
    return (
      <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#161b22] border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm transition-all duration-300 ${collapsed ? 'w-24' : 'w-80'} z-50`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to="/user" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white">CodePulse</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Contributor</span>
              </div>
            )}
          </Link>
        </div>
        <nav className="flex-1 px-4 py-8">
          <div className="space-y-1">
            {userLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === link.href ? 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <link.icon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    );
  }

  // Minecraft Admin Sidebar
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ${collapsed ? 'w-24' : 'w-72'} z-50`}>
      {/* Brand Logo - clean style */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white">
        <Link to="/admin" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 tracking-tight">CodePulse</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Panel</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col px-3">
        {!collapsed && (
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Main Menu
          </p>
        )}

        <div className="space-y-1">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-black text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                  }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {!collapsed && (
                  <span className="text-sm font-bold">{link.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card at bottom of nav */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} mb-4`}>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500 font-medium">Administrator</p>
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-all font-semibold text-sm shadow-sm group`}
          >
            <LogOut className="w-4 h-4 group-hover:text-red-600 transition-colors" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-gray-100 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors flex justify-center w-full"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
