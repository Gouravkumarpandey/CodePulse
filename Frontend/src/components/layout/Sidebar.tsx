import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, LayoutDashboard,
  Users, Settings, Activity, Menu, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarProps {
  role: 'user' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const pathname = location.pathname;
  const { collapsed, setCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();

  const isAdmin = role === 'admin';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const userLinks = [
    { href: '/user', icon: LayoutDashboard, label: 'Dashboard' },
    {
      label: 'GitHub Connection',
      icon: '/image/integration_9888476.png',
      isHeader: true,
      children: [
        { href: '/connect-github', icon: Activity, label: 'GitHub Account' },
        { href: '/repo-selection', icon: Activity, label: 'Repo Settings' },
      ]
    },
    { href: '/user/warnings', icon: '/image/alert_11540777.png', label: 'Alerts' },
    { href: '/user/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Players' },
    { href: '/admin/settings', icon: Settings, label: 'World Rules' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const renderIcon = (icon: any, className: string = "w-5 h-5") => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <img src={icon} alt="icon" className={className} />;
    }
    const IconComponent = icon;
    return <IconComponent className={className} />;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-xl text-white shadow-xl"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-2xl border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl transition-all duration-500 ease-in-out z-[60] 
        ${collapsed ? 'w-20' : 'w-72'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex items-center justify-between">
          <Link to={isAdmin ? "/admin" : "/user"} className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg border border-white/20" />
            {!collapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">CodePulse</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{isAdmin ? 'Admin Panel' : 'Contributor'}</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3">
          <div className="space-y-1">
            {links.map((link: any, idx) => {
              if (link.isHeader && !collapsed) {
                return (
                  <div key={`header-${idx}`} className="mt-6 mb-2 px-1 lg:px-4">
                    <div className="flex items-center gap-2 mb-2">
                      {renderIcon(link.icon, "w-4 h-4")}
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{link.label}</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {link.children.map((child: any, cIdx: number) => (
                        <Link
                          key={`c-${child.href}-${cIdx}`}
                          to={child.href}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${pathname === child.href
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                          {renderIcon(child.icon, "w-4 h-4")}
                          <span className="text-sm font-bold">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              if (link.isHeader && collapsed) {
                return (
                  <React.Fragment key={`collapsed-h-${idx}`}>
                    {link.children.map((child: any, cIdx: number) => (
                      <Link
                        key={`cc-${child.href}-${cIdx}`}
                        to={child.href}
                        className={`flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-300 mb-1 ${pathname === child.href
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        title={child.label}
                      >
                        {renderIcon(child.icon, "w-5 h-5")}
                      </Link>
                    ))}
                  </React.Fragment>
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={`link-${link.href || idx}`}
                  to={link.href}
                  className={`flex items-center ${collapsed ? 'justify-center w-12 h-12 mx-auto' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 group/item ${isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                    }`}
                >
                  <div className={`${isActive ? 'text-current' : 'text-gray-400 group-hover/item:text-current'}`}>
                    {renderIcon(link.icon, "w-5 h-5")}
                  </div>
                  {!collapsed && <span className="text-sm font-bold">{link.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* User Profile Hook */}
          <div className={`mt-10 border-t border-gray-200 dark:border-gray-800 pt-6 px-2`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} mb-4`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white overflow-hidden">
                  {user?.avatarId ? (
                    <img
                      src={[
                        '',
                        '/assets/avtar/icons8-minecraft-grass-cube-50.png',
                        '/assets/avtar/icons8-minecraft-logo-50.png',
                        '/assets/avtar/icons8-minecraft-main-character-50.png',
                        '/assets/avtar/icons8-minecraft-main-character-50-2.png'
                      ][user.avatarId] || ''}
                      alt="avatar"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="font-black text-xs">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-700">
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tighter">{user?.username || 'User'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">{isAdmin ? 'Administrator' : 'Contributor'}</span>
                    {!isAdmin && (
                      <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded-full border border-yellow-500/20">
                        <img src="/coin-svgrepo-com.svg" className="w-3 h-3 invert dark:invert-0" alt="coins" />
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">{user?.coins || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => logout()}
              className={`w-full flex items-center ${collapsed ? 'justify-center h-12' : 'px-4 py-3'} bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-sm group/logout`}
            >
              <img src="/image/door_9403261.png" alt="logout" className="w-4 h-4 group-hover/logout:scale-110 transition-transform" />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </nav>

        {/* Collapse Toggle Button (Hidden on Mobile) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex mx-3 mb-6 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 rounded-xl transition-all justify-center shadow-inner"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </aside>
    </>
  );
}
