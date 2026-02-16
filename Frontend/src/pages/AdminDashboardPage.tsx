import { useState, useEffect } from 'react';
import {
  Users, Zap, Ban, AlertTriangle, Activity,
  Search, Filter, Settings as SettingsIcon,
  ShieldAlert, RefreshCw, Layout, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import UsersTable from '@/components/admin/UsersTable';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { api } from '@/services/api';

import { useSidebar } from '@/context/SidebarContext';

const AdminDashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  // State variables
  const [activeTab, setActiveTab] = useState('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: 'Total Players', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Active Now', value: '0', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { label: 'Violations', value: '0', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Commits Today', value: '0', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Avg Score', value: '0', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ]);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hackathonStatus, setHackathonStatus] = useState<any>({ isActive: false, startTime: null });

  // Icon mapping helper
  const getIcon = (iconName: string) => {
    const icons: any = { Users, Activity, AlertTriangle, Zap, ShieldAlert };
    return icons[iconName] || Activity;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [statsRes, usersRes, statusRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/users?limit=100'),
          api.get('/admin/hackathon/status')
        ]);

        if (statusRes.data.success) {
          setHackathonStatus(statusRes.data.data);
        }

        if (statsRes.data.success) {
          const { stats: apiStats, liveFeed: apiFeed, chartData: apiChart } = statsRes.data.data;

          // Map API stats to component format with icons
          const formattedStats = apiStats.map((stat: any) => ({
            ...stat,
            icon: getIcon(stat.icon)
          }));

          setStats(formattedStats);
          setLiveFeed(apiFeed);
          setChartData(apiChart || []);
        }

        if (usersRes.data.success) {
          setUsers(usersRes.data.data.users);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchData();
      // Poll every 30 seconds for live updates
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // If loading, show simple loader or nothing
  if (loading) return null;

  // If not authenticated, show Admin Login Form (instead of redirecting to generic login)
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // If authenticated but not admin, show access denied
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen admin-github-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">
            Your account ({user?.email}) does not have administrator privileges.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/user')}
              className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to User Dashboard
            </button>
            <button
              onClick={() => {
                // Logout logic provided by auth context would be better here, 
                // but simpler to redirect or let them switch
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-github-bg flex font-sans text-white">
      <Sidebar role="admin" />
      <main className={`flex-1 p-8 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                Admin Dashboard
              </h1>
              <p className="text-gray-200 mt-2 font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                Hackathon Monitoring Command Center
              </p>
            </div>
            <div className="flex gap-4 items-center">
              {/* Hackathon Control */}
              <button
                onClick={async () => {
                  try {
                    const endpoint = hackathonStatus.isActive ? '/admin/hackathon/end' : '/admin/hackathon/start';
                    const res = await api.post(endpoint);
                    if (res.data.success) {
                      setHackathonStatus({
                        isActive: res.data.data.isActive,
                        startTime: res.data.data.startTime
                      });
                    }
                  } catch (err) {
                    console.error('Failed to toggle hackathon', err);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg uppercase tracking-wider text-xs border ${hackathonStatus.isActive
                  ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30 animate-pulse'
                  : 'bg-green-600/90 border-green-500 text-white hover:bg-green-500'
                  }`}
              >
                {hackathonStatus.isActive ? (
                  <>
                    <Ban className="w-4 h-4" />
                    End Hackathon
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Start Hackathon
                  </>
                )}
              </button>

              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-xs">
                <RefreshCw className="w-4 h-4" />
                Sync Data
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 w-fit">
            {[
              { id: 'monitoring', label: 'Monitor', icon: Layout },
              { id: 'live-feed', label: 'Live Logs', icon: Activity },
              { id: 'violations', label: 'Sentinel', icon: ShieldAlert },
              { id: 'settings', label: 'Config', icon: SettingsIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wider ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-slate-900/60 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-xl hover:bg-slate-900/80 transition-all group">
                <div className={`w-10 h-10 rounded-xl ${stat.bg.replace('bg-', 'bg-').replace('50', '500/20')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.replace('text-', 'text-').replace('600', '400')}`} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors" style={{ fontFamily: '"Minecraftia", sans-serif' }}>{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'monitoring' && (
              <motion.div
                key="monitoring"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Activity Feed Snippet */}
                  <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-6 max-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Recent Activity</h3>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {liveFeed.slice(0, 4).map((event) => (
                        <div key={event.id} className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${event.type === 'COMMIT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                              {event.type}
                            </span>
                            <span className="text-xs text-gray-400 font-medium font-mono">{event.time}</span>
                          </div>
                          <span className="text-sm font-bold text-white">{event.user}</span>
                          <span className="text-xs text-gray-400 truncate font-mono">{event.repo}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('live-feed')} className="w-full mt-4 py-2 text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest transition-colors border-t border-white/10 pt-4">
                      View All Logs
                    </button>
                  </div>

                  {/* Chart Window */}
                  <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Commit Activity</h3>
                        <p className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">Live Hackathon Volume</p>
                      </div>
                      <select className="bg-slate-800 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 uppercase tracking-wide">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                      </select>
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#fff',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                              backdropFilter: 'blur(10px)'
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="commits"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorCommits)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Main Player Table */}
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Player Database</h3>
                    <div className="flex w-full md:w-auto gap-4">
                      <div className="relative flex-1 md:w-[320px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-400 transition-colors w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search players..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-white placeholder-gray-500 font-bold"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl uppercase tracking-wider text-xs">
                        <Filter className="w-4 h-4 text-blue-400" />
                        Filter
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    {isLoadingData ? (
                      <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <UsersTable users={users.filter(u =>
                        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )} />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'live-feed' && (
              <motion.div
                key="live-feed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Live Activity Log</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 shadow-inner">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live Updates Active</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {liveFeed.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/10 group bg-white/5">
                      <div className={`p-3 rounded-xl ${event.type === 'COMMIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {event.type === 'COMMIT' ? <Activity className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-base font-bold text-white">{event.user}</p>
                          <span className="text-xs text-gray-400 font-medium font-mono">{event.time}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5">
                          {event.type} detected in <span className="font-bold text-blue-300 font-mono">{event.repo}</span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'violations' && (
              <motion.div
                key="violations"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-8 text-center"
              >
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Sentinel Alert System</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-8 font-medium">
                  Monitoring 12 active flags across 3 repositories. Check resolution center for details.
                </p>
                <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-600/40 uppercase tracking-wider text-sm transform hover:-translate-y-1">
                  Open Resolution Center
                </button>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-8 text-center"
              >
                <div className="w-20 h-20 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <SettingsIcon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Global Configuration</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-8 font-medium">
                  Manage hackathon rules, integrations, and global settings from the dedicated settings page.
                </p>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all shadow-lg hover:shadow-white/20 uppercase tracking-wider text-sm transform hover:-translate-y-1"
                >
                  Open Configuration Panel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
