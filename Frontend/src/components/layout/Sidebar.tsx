import { Link, useLocation } from 'react-router-dom';
import { Link2, LayoutDashboard, Activity, AlertTriangle, Settings, Users, Database, Zap, LogOut } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  role: 'user' | 'admin';
  isCollapsed?: boolean;
}

export default function Sidebar({ role, isCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const pathname = location.pathname;

  const userLinks = [
    { href: '/repo-selection', icon: Link2, label: 'Integration' },
    { href: '/user', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/user/activity', icon: Activity, label: 'Activity' },
    { href: '/user/warnings', icon: AlertTriangle, label: 'Alerts' },
    { href: '/user/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-github-canvas-subtle border-r border-gray-200 dark:border-github-border flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-github-border">
        <Link to={role === 'admin' ? '/admin' : '/user'} className="flex items-center gap-3">
          <img 
            src="https://avatars.githubusercontent.com/u/18133?s=280&v=4" 
            alt="GitInfo Logo" 
            className="w-9 h-9 rounded-lg shadow-md"
          />
          {!isCollapsed && (
            <div>
              <span className="font-bold text-lg text-gray-900 dark:text-github-text block">GitInfo</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gray-100 dark:bg-github-canvas-inset text-gray-900 dark:text-github-text font-medium'
                    : 'text-gray-600 dark:text-github-text-secondary hover:bg-gray-50 dark:hover:bg-github-canvas-inset hover:text-gray-900 dark:hover:text-github-text'
                }`}
                title={isCollapsed ? link.label : ''}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-amber-500'}`} />
                {!isCollapsed && <span className="text-sm">{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Usage Section (User only) */}
      {role === 'user' && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 dark:bg-github-canvas-inset rounded-lg p-4 border border-gray-200 dark:border-github-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-700 dark:text-github-text uppercase tracking-wide">
                Usage
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500 dark:text-github-text-secondary" />
                  <span className="text-sm text-gray-600 dark:text-github-text-secondary">Repositories</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-github-text">0/1</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500 dark:text-github-text-secondary" />
                  <span className="text-sm text-gray-600 dark:text-github-text-secondary">Analysis</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-github-text">0/10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-github-border p-4 space-y-2">
        <ThemeToggle />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-github-text-secondary hover:bg-gray-100 dark:hover:bg-github-canvas-inset hover:text-gray-900 dark:hover:text-github-text rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
