import { Link, useLocation } from 'react-router-dom';
import { Link2, LayoutDashboard, Activity, AlertTriangle, Settings, Users, Database, Zap, LogOut } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  role: 'user' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const pathname = location.pathname;

  const userLinks = [
    { href: '/repo-selection', icon: Link2, label: 'Integration', badge: null },
    { href: '/user', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { href: '/user/activity', icon: Activity, label: 'Activity', badge: null },
    { href: '/user/warnings', icon: AlertTriangle, label: 'Alerts', badge: '2' },
    { href: '/user/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { href: '/admin/users', icon: Users, label: 'Users', badge: null },
    { href: '/admin/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <aside className={
      'fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-white to-gray-50/50 dark:from-[#0d1117] dark:to-[#161b22] border-r border-gray-200/80 dark:border-[#30363d] flex flex-col transition-all duration-300 shadow-xl'
    }>
      {/* Logo & Brand */}
      <div className="relative z-10 p-6 border-b border-gray-200/50 dark:border-[#30363d]/50 bg-white/50 dark:bg-[#0d1117]/50 backdrop-blur-sm flex-shrink-0">
        <Link to={role === 'admin' ? '/admin' : '/user'} className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="Codepulse Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-lg group-hover:shadow-xl transition-shadow bg-white dark:bg-[#161b22] p-1"
            style={{ maxWidth: '40px', maxHeight: '40px' }}
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              CodePulse
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {role === 'admin' ? 'Admin Panel' : 'Developer Hub'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-3 py-6 flex-shrink-0">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </p>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-600/20 dark:to-orange-600/20 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-[#161b22] hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-r-full" />
                )}
                <div className="relative ml-1">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive 
                      ? 'text-amber-600 dark:text-amber-500' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-500'
                  }`} />
                  {link.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-medium flex-1 ${isActive ? 'font-semibold' : ''}`}>
                  {link.label}
                </span>
                {link.badge && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* GitHub Character Image */}
      {role === 'user' && (
        <div className="relative z-10 px-6 pb-4 flex justify-center flex-shrink-0">
          <img 
            src="/image/gitcharacter.svg" 
            alt="GitHub Character" 
            className="w-32 h-32 object-contain"
          />
        </div>
      )}

      {/* User Profile Section */}
      <div className="relative z-10 border-t border-gray-200/50 dark:border-[#30363d]/50 p-4 bg-white/30 dark:bg-[#0d1117]/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 dark:from-amber-600/10 dark:to-orange-600/10 border border-amber-200/50 dark:border-amber-800/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
            {useAuth().user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {useAuth().user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {useAuth().user?.email || ''}
            </p>
          </div>
        </div>
        
        <ThemeToggle />
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group mt-2"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
