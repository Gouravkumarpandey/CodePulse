import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, GitBranch,
  Award, Bell, Timer, ChevronLeft, ChevronRight,
  Menu, X, LogOut, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/context/SidebarContext';
import AIChatPanel from './AIChatPanel';

interface SidebarProps {
  role: 'user' | 'admin';
}

const userLinks = [
  { href: '/user/hackathon', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/repo-selection', icon: GitBranch, label: 'Repositories' },
  { href: '/user/activity', icon: Activity, label: 'Activity' },
  { href: '/user/warnings', icon: Bell, label: 'Warnings', badge: true },
  { href: '/user/achievements', icon: Award, label: 'Achievements' },
  { href: '/user/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { collapsed, setCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const [aiOpen, setAiOpen] = useState(false);
  const pathname = location.pathname;
  const isAdmin = role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  const avatarSrcs = [
    '',
    '/assets/avtar/icons8-minecraft-grass-cube-50.png',
    '/assets/avtar/icons8-minecraft-logo-50.png',
    '/assets/avtar/icons8-minecraft-main-character-50.png',
    '/assets/avtar/icons8-minecraft-main-character-50-2.png',
  ];

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white shadow-xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-50
          bg-zinc-950 border-r border-white/[0.06]
          flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Brand */}
        <div className={`flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-sm">CP</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-white font-bold text-sm tracking-wide block">CodePulse</span>
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Dashboard</span>
            </div>
          )}
          {/* Mobile close */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="ml-auto lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle Collapse Button (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-md z-10"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;

            return (
              <div key={link.href} className="relative group">
                <Link
                  to={link.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative
                    ${isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500 rounded-r-full" />
                  )}

                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />

                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{link.label}</span>
                  )}

                  {!collapsed && (link as any).badge && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                      !
                    </span>
                  )}
                </Link>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-zinc-800 border border-white/10 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                    {link.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Assistant Button */}
          <div className="relative group pt-2">
            <button
              onClick={() => setAiOpen(true)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 text-blue-400
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <img src="/ai.png" alt="AI" className="w-5 h-5 object-contain flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">AI Assistant</span>}
            </button>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-zinc-800 border border-white/10 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                AI Assistant
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
              </div>
            )}
          </div>
        </nav>

        {/* Bottom: User Profile + Logout */}
        <div className="flex-shrink-0 border-t border-white/[0.06] p-3 space-y-3">
          {/* User Info */}
          <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1.5px] shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : user?.avatarId !== undefined ? (
                  <img
                    src={avatarSrcs[user.avatarId] || avatarSrcs[1]}
                    alt="avatar"
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-white font-black text-xs">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-white text-sm font-semibold truncate">{user?.username || 'User'}</p>
                <p className="text-zinc-500 text-[10px] truncate">{user?.email || ''}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="relative group">
            <button
              onClick={() => logout()}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                text-zinc-400 hover:bg-red-500/10 hover:text-red-400
                transition-all duration-150 text-sm font-medium
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-zinc-800 border border-white/10 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                Sign Out
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
