import { useState } from 'react';
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

import { useSidebar } from '@/context/SidebarContext';

const AdminDashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  // State variables
  const [activeTab, setActiveTab] = useState('monitoring');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock stats data
  const stats = [
    { label: 'Total Players', value: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Active Now', value: '18', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { label: 'Violations', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Commits Today', value: '127', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Avg Score', value: '78', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ];

  // Mock live feed data
  const liveFeed = [
    { id: 1, type: 'COMMIT', user: 'Alice', repo: 'project-alpha', time: '2m ago', bg: 'bg-green-50', color: 'text-green-700' },
    { id: 2, type: 'VIOLATION', user: 'Bob', repo: 'project-beta', time: '5m ago', bg: 'bg-red-50', color: 'text-red-700' },
    { id: 3, type: 'COMMIT', user: 'Charlie', repo: 'project-gamma', time: '8m ago', bg: 'bg-green-50', color: 'text-green-700' },
    { id: 4, type: 'COMMIT', user: 'Diana', repo: 'project-delta', time: '12m ago', bg: 'bg-green-50', color: 'text-green-700' },
    { id: 5, type: 'VIOLATION', user: 'Eve', repo: 'project-epsilon', time: '15m ago', bg: 'bg-red-50', color: 'text-red-700' },
  ];

  // Mock chart data
  const chartData = [
    { name: '00:00', commits: 12 },
    { name: '04:00', commits: 8 },
    { name: '08:00', commits: 25 },
    { name: '12:00', commits: 42 },
    { name: '16:00', commits: 35 },
    { name: '20:00', commits: 28 },
  ];

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
    <div className="min-h-screen admin-github-bg flex font-sans text-gray-900">
      <Sidebar role="admin" />
      <main className={`flex-1 p-8 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Hackathon Monitoring Command Center
              </p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg font-bold transition-all shadow-sm hover:shadow-md">
                <RefreshCw className="w-5 h-5" />
                Sync
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Zap className="w-5 h-5" />
                Action
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'monitoring', label: 'Monitor', icon: Layout },
              { id: 'live-feed', label: 'Live Logs', icon: Activity },
              { id: 'violations', label: 'Sentinel', icon: ShieldAlert },
              { id: 'settings', label: 'Config', icon: SettingsIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-medium ${activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all`}>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
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
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {liveFeed.slice(0, 4).map((event) => (
                        <div key={event.id} className="flex flex-col p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${event.bg} ${event.color}`}>
                              {event.type}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">{event.time}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{event.user}</span>
                          <span className="text-xs text-gray-500 truncate">{event.repo}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('live-feed')} className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-black font-semibold transition-colors border-t border-gray-100 pt-4">
                      View All Logs
                    </button>
                  </div>

                  {/* Chart Window */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Commit Activity</h3>
                        <p className="text-sm text-gray-500">Live Hackathon Volume</p>
                      </div>
                      <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                      </select>
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
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
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Player Database</h3>
                    <div className="flex w-full md:w-auto gap-4">
                      <div className="relative flex-1 md:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search players..."
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                        <Filter className="w-5 h-5" />
                        Filter
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <UsersTable users={[]} />
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
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Live Activity Log</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase">Live Updates Active</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {liveFeed.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group">
                      <div className={`p-3 rounded-xl ${event.bg} ${event.color}`}>
                        {event.type === 'COMMIT' ? <Activity className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-base font-bold text-gray-900">{event.user}</p>
                          <span className="text-xs text-gray-500 font-medium">{event.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {event.type} detected in <span className="font-medium text-gray-900">{event.repo}</span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
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
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center"
              >
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sentinel Alert System</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Monitoring 12 active flags across 3 repositories. Check resolution center for details.
                </p>
                <button className="px-8 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
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
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center"
              >
                <div className="w-20 h-20 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SettingsIcon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Global Configuration</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Manage hackathon rules, integrations, and global settings from the dedicated settings page.
                </p>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
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
