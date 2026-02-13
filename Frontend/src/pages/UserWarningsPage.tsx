import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, XCircle, ShieldAlert, CheckCircle2, TrendingDown, Clock, GitCommit, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import WarningList from '@/components/user/WarningList';
import { api } from '@/services/api';
import { Commit } from '@/types/commit';

import { useSidebar } from '@/context/SidebarContext';

const UserWarningsPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState<Commit[]>([]);
  const [violations, setViolations] = useState<Commit[]>([]);
  const [allCommitsLength, setAllCommitsLength] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'violations' | 'warnings'>('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWarnings();
    }
  }, [isAuthenticated]);

  const loadWarnings = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/user/repositories');
      const repoList = response.data?.data?.repositories || response.data?.repositories || [];

      if (!Array.isArray(repoList)) {
        console.error('Repositories is not an array:', repoList);
        setLoadingData(false);
        return;
      }

      const allCommits: Commit[] = [];
      for (const repo of repoList) {
        if (!repo?._id) continue;
        try {
          const activityRes = await api.get(`/user/activity/${repo._id}`);
          const commits = activityRes.data?.data?.commits || activityRes.data?.commits || [];
          if (Array.isArray(commits)) {
            allCommits.push(...commits);
          }
        } catch (err) {
          console.error(`Failed to load activity for repo ${repo._id}:`, err);
        }
      }

      setAllCommitsLength(allCommits.length);
      const warns = allCommits.filter(c => c.status === 'WARNING');
      const viols = allCommits.filter(c => c.status === 'VIOLATION');

      setWarnings(warns);
      setViolations(viols);
    } catch (error) {
      console.error('Failed to load warnings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusMessage = () => {
    if (violations.length > 0) return 'Critical Issues Detected';
    if (warnings.length > 0) return 'Attention Required';
    return 'All Clear';
  };

  if (loading) {
    return (
      <div className="min-h-screen user-dashboard-bg flex items-center justify-center">
        <div className="text-white font-bold uppercase tracking-widest text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalIssues = violations.length + warnings.length;

  return (
    <div className="min-h-screen user-dashboard-bg flex font-sans text-white overflow-x-hidden">
      <Sidebar role="user" />

      {/* Main Content */}
      <div className={`flex-1 w-full transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="p-4 md:p-8 lg:p-12 overflow-y-auto min-h-screen">
          <main className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: '"Minecraftia", sans-serif' }}
                >
                  System Alerts
                </motion.h1>
                <p className="text-gray-200 mt-2 font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Review and resolve coding violations and system warnings
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                <div className={`p-3 rounded-xl ${totalIssues > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {totalIssues > 0 ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Status</div>
                  <div className={`text-lg font-black uppercase tracking-tight ${totalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {getStatusMessage()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{violations.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Violations</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{warnings.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warnings</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-xl group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{allCommitsLength}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Monitored</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex border-b border-white/10">
                {(['all', 'violations', 'warnings'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                      ? 'bg-white/10 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tab === 'all' ? `All Issues (${totalIssues})` :
                      tab === 'violations' ? `Violations (${violations.length})` :
                        `Warnings (${warnings.length})`}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {loadingData ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Analyzing Commits...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {(activeTab === 'all' || activeTab === 'violations') && violations.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <XCircle className="w-4 h-4" /> Critical violations
                        </h3>
                        <WarningList items={violations} type="violation" />
                      </div>
                    )}
                    {(activeTab === 'all' || activeTab === 'warnings') && warnings.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> System warnings
                        </h3>
                        <WarningList items={warnings} type="warning" />
                      </div>
                    )}
                    {totalIssues === 0 && !loadingData && (
                      <div className="py-20 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No issues detected</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-gradient-to-br from-indigo-600/60 to-purple-800/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Improvement Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <Clock className="w-6 h-6 text-blue-300 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-200">Maintain regular commit intervals (at least every 24-48 hours) to maximize your consistency score.</p>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <GitCommit className="w-6 h-6 text-purple-300 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-200">Break down large features into smaller, atomic commits to avoid "Burst" violation detections.</p>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <TrendingDown className="w-6 h-6 text-green-300 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-200">Avoid bulk commits. Spreading your effort over time creates a healthier development profile.</p>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <AlertCircle className="w-6 h-6 text-orange-300 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-200">Watch for warnings early. Resolving patterns early prevents Grade-F violations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserWarningsPage;
