import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  role: 'user' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { user } = useAuth();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const userLinks = [
    { href: '/repo-selection', icon: '/image/integration_9888476.png', label: 'Integration', badge: null },
    { href: '/user', icon: '/image/dashboard_11264787.png', label: 'Dashboard', badge: null },
    { href: '/user/activity', icon: '/image/gear_13640426.png', label: 'Activity Log', badge: null },
    { href: '/user/warnings', icon: '/image/alert_11540777.png', label: 'Alerts', badge: '2' },
    { href: '/user/settings', icon: '/image/gear_13640426.png', label: 'Settings', badge: null },
  ];

  const adminLinks = [
    { href: '/admin', icon: '/image/dashboard_11264787.png', label: 'Dashboard', badge: null },
    { href: '/admin/users', icon: '/image/user_10948899.png', label: 'Users', badge: null },
    { href: '/admin/settings', icon: '/image/gear_13640426.png', label: 'Settings', badge: null },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ${
      collapsed ? 'w-24' : 'w-80'
    }`}>
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <Link to={role === 'admin' ? '/admin' : '/user'} className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Codepulse Logo"
            className="w-10 h-10 object-contain rounded"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">CodePulse</span>
              <span className="text-xs text-gray-500">Dashboard</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2 py-4' : 'px-4 py-8'}`}>
        {/* Main Menu Label */}
        {!collapsed && (
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Main Menu
          </p>
        )}
        
        {/* Menu Items */}
        <div className={collapsed ? 'space-y-2' : 'space-y-1'}>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                to={link.href}
                title={collapsed ? link.label : ''}
                className={`flex items-center gap-3 ${collapsed ? 'px-2 py-2 justify-center' : 'px-4 py-3'} rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <img src={link.icon} alt={link.label} className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} object-contain flex-shrink-0`} />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1">{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {link.badge}
                      </span>
                    )}
                    {(link.label === 'Dashboard' || link.label === 'Settings') && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* GitHub Character Image - Only show when collapsed */}
      {role === 'user' && collapsed && (
        <div className="px-6 pb-4 flex justify-center flex-shrink-0">
          <img 
            src="/image/gitcharacter.svg" 
            alt="GitHub Character" 
            className="w-20 h-20 object-contain"
          />
        </div>
      )}

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <img
            src="/image/user_10948899.png"
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-contain bg-gradient-to-br from-orange-400 to-orange-500 p-1 flex-shrink-0"
          />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                profileMenuOpen ? 'rotate-90' : ''
              }`} />
            </>
          )}
        </button>
        
        {/* Logout Menu */}
        {profileMenuOpen && !collapsed && (
          <button
            onClick={() => {
              logout();
              setProfileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t border-gray-200 flex justify-center flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
