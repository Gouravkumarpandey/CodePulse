import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, LayoutDashboard,
  Users, Settings, Menu, X,
  GitBranch, Award, Bell, Timer, HelpCircle, UserPlus, Zap, Bot
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/context/SidebarContext';
import AIChatPanel from './AIChatPanel';

interface SidebarProps {
  role: 'user' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const pathname = location.pathname;
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const [aiOpen, setAiOpen] = useState(false);

  const isAdmin = role === 'admin';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Enforce collapsed state configuration
  const collapsed = true;

  const userLinks = [
    { href: '/user', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/repo-selection', icon: GitBranch, label: 'Repositories' },
    { href: '/user/hackathon', icon: Timer, label: 'Hackathon Mode' },
    { href: '/user/team', icon: Users, label: 'Team Analytics' },
    { isHeader: true, label: 'Resources' },
    { href: '/user/achievements', icon: Award, label: 'Achievements', badge: '10' },
    { href: '/user/warnings', icon: Bell, label: 'Notifications', badge: '2' },
    { isHeader: true, label: 'Other' },
    { href: '/user/settings', icon: Settings, label: 'Settings' }
  ];

  const adminLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Players' },
    { href: '/admin/settings', icon: Settings, label: 'World Rules' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-[60] p-3 bg-black border border-white/10 rounded-xl text-white shadow-xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Floating Sidebar Strip */}
      <aside className={`fixed left-4 top-4 h-[calc(100vh-2rem)] bg-zinc-950 border border-white/10 flex flex-col shadow-2xl transition-all duration-500 ease-in-out z-[60] rounded-[24px] overflow-hidden w-20 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pt-6 px-3 space-y-1">
          {links.map((link: any, idx) => {
            if (link.isHeader) {
               return <div key={`header-${idx}`} className="h-4" />
            }
            const isActive = pathname === link.href;

            return (
              <Link
                key={`link-${link.href || idx}`}
                to={link.href}
                className={`flex items-center rounded-xl transition-all duration-200 group/item leading-none justify-center w-12 h-12 mx-auto
                  ${isActive ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover/item:text-white transition-colors'}`} />
              </Link>
            );
          })}

          {/* AI trigger Button */}
          <div className="pt-2">
            <button
                onClick={() => setAiOpen(true)}
                className={`flex items-center rounded-xl transition-all duration-200 group/item leading-none justify-center w-12 h-12 mx-auto bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/10 shadow-lg`}
            >
                <img src="/ai.png" alt="ai" className="w-5 h-5 object-contain" />
            </button>
          </div>
        </nav>

        {/* Bottom Profile action alignment */}
        <div className={`p-4 border-t border-white/5 flex-shrink-0 space-y-3`}>
          <div className={`flex items-center gap-3 justify-center`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center text-white overflow-hidden">
                {user?.avatarId !== undefined ? (
                  <img
                    src={[
                      '',
                      '/assets/avtar/icons8-minecraft-grass-cube-50.png',
                      '/assets/avtar/icons8-minecraft-logo-50.png',
                      '/assets/avtar/icons8-minecraft-main-character-50.png',
                      '/assets/avtar/icons8-minecraft-main-character-50-2.png'
                    ][user.avatarId || 1] || ''}
                    alt="avatar"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="font-black text-xs">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className={`w-full flex items-center justify-center h-11 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-widest shadow-lg group/logout`}
          >
            <ChevronLeft className="w-4 h-4 group-hover/logout:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </aside>

      {/* AIChatPanel Drawer */}
      <AIChatPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
