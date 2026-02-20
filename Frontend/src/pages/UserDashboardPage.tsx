import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch, GitCommit, TrendingUp, AlertCircle, CheckCircle, Clock,
  Activity, ChevronDown, Settings, Award, Zap, Users, Shield,
  Timer, Trophy, Star, FileText, Share2, X, Download, Linkedin, Copy, Check, Link as LinkIcon, ExternalLink,
  Github, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/services/api';
import { ConsistencyAnalysis } from '@/types';
import { Commit } from '@/types/commit';
import { useSidebar } from '@/context/SidebarContext';

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const { collapsed } = useSidebar();

  const [consistencyData, setConsistencyData] = useState<ConsistencyAnalysis | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [commitTimeline, setCommitTimeline] = useState<Array<{ date: string; commits: number }>>([]);
  const [recentCommits, setRecentCommits] = useState<Commit[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [hackathonStatus, setHackathonStatus] = useState({ isActive: false, startTime: null });
  const [showShareModal, setShowShareModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login');
    if (window.location.pathname === '/user/profilecard') {
      setShowShareModal(true);
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const checkHackathonStatus = async () => {
      try {
        const res = await api.get('/user/hackathon/status');
        if (res.data.success) {
          setHackathonStatus(res.data.data);
        }
      } catch (err) {
        console.error('Failed to checked hackathon status');
      }
    };

    checkHackathonStatus();
    const interval = setInterval(checkHackathonStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadRepositories();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedRepo) {
      localStorage.setItem('selectedRepoId', selectedRepo._id || selectedRepo.id);
      loadRepositoryAnalysis();
    } else {
      setCommitTimeline([]);
      setRecentCommits([]);
    }
  }, [selectedRepo]);

  const loadRepositoryAnalysis = useCallback(async () => {
    const repoId = selectedRepo?._id || selectedRepo?.id;
    if (!repoId) return;

    try {
      const response = await api.get(`/user/activity/${repoId}`);
      const summary = response.data.data?.summary || response.data.summary;
      const commits = response.data.data?.commits || response.data.commits || [];

      if (summary) {
        setConsistencyData({
          score: summary.consistencyScore || 0,
          grade: summary.consistencyGrade || 'F',
          totalCommits: summary.totalCommits || 0,
          averageGap: summary.averageGap || 0,
          longestGap: summary.longestGap || 0,
          burstCommits: summary.burstCommits || 0,
          lastMinuteCommits: summary.lastMinuteCommits || 0,
          timelineSpan: summary.timelineSpan || 0,
          violations: summary.violations || 0,
          warnings: summary.warnings || 0,
          aiInsights: summary.aiInsights || ['Analyzing commit patterns...'],
          suggestions: summary.suggestions || [],
          distribution: summary.timeDistribution || { quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0 },
          contributors: summary.contributors || [],
          badges: summary.badges || [],
          health: summary.health || {
            commitMessageScore: 0, prCount: 0, bugFixRatio: '0', featureRatio: '0', refactorRatio: '0'
          }
        });
      }

      if (commits.length > 0) {
        setRecentCommits(commits.slice(0, 5));
        setCommitTimeline(generateTimelineFromCommits(commits));
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    }
  }, [selectedRepo]);

  const loadRepositories = async () => {
    try {
      const response = await api.get('/user/repositories');
      const repos = response.data.data?.repositories || response.data.repositories || [];
      setRepositories(repos);
      setRepositories(repos);
      if (repos.length > 0) {
        const savedRepoId = localStorage.getItem('selectedRepoId');
        const savedRepo = savedRepoId ? repos.find((r: any) => (r._id || r.id) === savedRepoId) : null;
        const activeRepo = savedRepo || repos.find((r: any) => r.isActive) || repos[0];
        setSelectedRepo(activeRepo);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const generateTimelineFromCommits = (commits: Commit[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const commitsByDate: Record<string, number> = {};
    commits.forEach(commit => {
      const dateStr = new Date(commit.commitDate).toISOString().split('T')[0];
      commitsByDate[dateStr] = (commitsByDate[dateStr] || 0) + 1;
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      commits: commitsByDate[date] || 0
    }));
  };

  const formatTimeAgo = (date: Date) => {
    const diffMs = new Date().getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityStatus = () => {
    if (!recentCommits.length) return { status: 'Inactive', color: 'red', message: 'No commits detected' };
    const hoursSince = (new Date().getTime() - new Date(recentCommits[0].commitDate).getTime()) / 3600000;
    if (hoursSince < 24) return { status: 'Active', color: 'green', message: `Last commit ${formatTimeAgo(recentCommits[0].commitDate)}` };
    if (hoursSince < 72) return { status: 'At Risk', color: 'yellow', message: 'Warning: Inactivity detected' };
    return { status: 'Inactive', color: 'red', message: 'High inactivity gap' };
  };

  const activityStatus = getActivityStatus();

  if (loading || !isAuthenticated) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen user-dashboard-bg flex font-sans text-white overflow-x-hidden">
      <Sidebar role="user" />
      <div className={`flex-1 w-full transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="p-4 md:p-8 lg:p-12 overflow-y-auto min-h-screen">
          <main className="max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase items-center flex gap-3" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  User Dashboard
                  {hackathonStatus.isActive && <span className="bg-red-600 text-xs px-3 py-1 rounded-full animate-pulse">HACKATHON LIVE</span>}
                </h1>
                <p className="text-gray-300 mt-2 font-medium">Track performance, improve consistency, and earn rewards.</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">

                {/* Repo Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                    className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <GitBranch className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-sm">{selectedRepo?.name || 'Select Repository'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showRepoDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                      {repositories.map(repo => (
                        <button
                          key={repo._id || repo.id}
                          onClick={() => { setSelectedRepo(repo); setShowRepoDropdown(false); }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/10 text-sm font-medium transition-colors border-b border-white/5 ${selectedRepo?._id === repo._id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}`}
                        >
                          {repo.name}
                        </button>
                      ))}
                      <button onClick={() => navigate('/repo-selection')} className="w-full px-4 py-3 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase">
                        + Add Repository
                      </button>
                    </div>
                  )}
                </div>

                {/* Coins */}
                <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/30">
                  <img src="/coin-svgrepo-com.svg" className="w-6 h-6" alt="Coins" />
                  <span className="font-black text-yellow-400">{user?.coins || 0}</span>
                </div>
              </div>
            </div>

            {/* GitHub Connection Prompt for users who skipped */}
            {!sessionStorage.getItem('github_token') && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500/20 via-orange-600/20 to-red-500/20 border-2 border-orange-500/50 rounded-2xl p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Connect Your GitHub Account</h3>
                      <p className="text-gray-300 text-sm">
                        Link your GitHub to track commits, analyze activity, and unlock full dashboard features
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/connect-github')}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Github className="w-5 h-5" />
                    Connect Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {!selectedRepo ? (
              <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                <GitBranch className="w-20 h-20 text-white/20 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No Repository Selected</h2>
                <button onClick={() => navigate('/repo-selection')} className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition">Connect Repo</button>
              </div>
            ) : (
              <>
                {/* 1. Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Status */}
                  <div className={`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden group ${activityStatus.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
                    activityStatus.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Activity Status</p>
                        <h3 className="text-3xl font-black mt-1" style={{ fontFamily: '"Minecraftia", sans-serif' }}>{activityStatus.status}</h3>
                      </div>
                      {activityStatus.color === 'green' ? <CheckCircle className="w-8 h-8 text-green-400" /> : <AlertCircle className="w-8 h-8 text-red-400" />}
                    </div>
                    <p className="text-sm font-medium opacity-80">{activityStatus.message}</p>
                  </div>

                  {/* Consistency Score */}
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl relative group hover:border-purple-500/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Consistency</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h3 className="text-4xl font-black">{consistencyData?.score || 0}</h3>
                          <span className={`text-xl font-black ${(consistencyData?.score || 0) >= 80 ? 'text-green-400' : (consistencyData?.score || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>/100</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-black text-xl border border-purple-500/30">
                        {consistencyData?.grade || '-'}
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000" style={{ width: `${consistencyData?.score || 0}%` }} />
                    </div>
                  </div>

                  {/* Streak / Stats */}
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Commits</p>
                      <GitCommit className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-4xl font-black">{consistencyData?.totalCommits || 0}</h3>
                    <div className="flex gap-4 mt-4 text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Avg Gap: {Math.round(consistencyData?.averageGap || 0)}h</span>
                      <span className="flex items-center gap-1 text-orange-400"><Zap className="w-3 h-3" /> Bursts: {consistencyData?.burstCommits || 0}</span>
                    </div>
                  </div>

                  {/* Last Commit */}
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-blue-500/50 transition-colors">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Latest Activity</p>
                    {recentCommits.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium line-clamp-2 mb-2 italic">"{recentCommits[0].message}"</p>
                        <p className="text-xs text-gray-400 font-mono bg-white/5 py-1 px-2 rounded inline-block">{recentCommits[0].commitSha.substring(0, 7)}</p>
                      </div>
                    ) : <p className="text-gray-500 text-sm">No recent activity</p>}
                  </div>
                </div>

                {/* 2. Hackathon Mode Panel */}
                {hackathonStatus.isActive && (
                  <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-slate-900/80 p-6 md:p-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className="absolute top-0 right-0 p-32 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 animate-pulse">
                          <Timer className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white tracking-wide">HACKATHON MODE ACTIVE</h2>
                          <p className="text-red-300/80 text-sm font-mono">Session started: {new Date(hackathonStatus.startTime).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <div className="text-lg font-bold text-red-500 uppercase tracking-widest mb-1">Live Commits</div>
                        <div className="text-4xl font-black text-white">{recentCommits.filter(c => hackathonStatus.startTime && new Date(c.commitDate) > new Date(hackathonStatus.startTime)).length}</div>
                      </div>
                    </div>
                    {/* Hackathon Rules/Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                      <div className="bg-black/30 p-4 rounded-xl border border-red-500/20">
                        <div className="text-xs text-red-300 uppercase font-bold mb-1">Burst Rate</div>
                        <div className="text-2xl font-black text-white">Safe</div>
                      </div>
                      <div className="bg-black/30 p-4 rounded-xl border border-red-500/20">
                        <div className="text-xs text-red-300 uppercase font-bold mb-1">Time Active</div>
                        <div className="text-xl font-mono text-white">02:14:10</div>
                      </div>
                      <div className="bg-black/30 p-4 rounded-xl border border-red-500/20">
                        <div className="text-xs text-red-300 uppercase font-bold mb-1">Fairness Score</div>
                        <div className="text-2xl font-black text-green-400">100%</div>
                      </div>
                      <div className="bg-black/30 p-4 rounded-xl border border-red-500/20">
                        <div className="text-xs text-red-300 uppercase font-bold mb-1">Team Rank</div>
                        <div className="text-2xl font-black text-yellow-400">#3</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Main Grid: Timeline + AI Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Timeline Graph */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Commit Timeline
                      </h3>
                      <div className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20">7 Days</div>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={commitTimeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                          <Line type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Insights - Smart Feedback */}
                  <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      AI Coach Insights
                    </h3>
                    <div className="space-y-4 relative z-10">
                      {(Array.isArray(consistencyData?.aiInsights) ? consistencyData.aiInsights : [consistencyData?.aiInsights]).slice(0, 3).map((insight, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-2 h-full bg-indigo-500 rounded-full" />
                          <p className="text-sm text-gray-200 leading-relaxed font-medium">
                            {insight}
                          </p>
                        </div>
                      ))}
                      {!consistencyData?.aiInsights && (
                        <div className="text-center text-gray-500 py-8 italic">Use your brain, make some commits first.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Team Contribution & Repo Health */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team View */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        Top Contributors
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {consistencyData?.contributors && consistencyData.contributors.length > 0 ? (
                        consistencyData.contributors.slice(0, 4).map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-white'}`}>
                                {idx + 1}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-white">{c.name}</div>
                                <div className="text-xs text-gray-400 font-mono">{c.percentage}%</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-white">{c.commits}</div>
                              <div className="text-[10px] text-gray-500 uppercase">Commits</div>
                            </div>
                          </div>
                        ))
                      ) : <p className="text-gray-500 text-sm text-center">No contributor data</p>}
                    </div>
                  </div>

                  {/* Repo Health */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-400" />
                        Repository Health
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metric 1 */}
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center group hover:border-teal-500/30 transition-all">
                        <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{consistencyData?.health?.commitMessageScore || 0}%</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Msg Quality</div>
                      </div>
                      {/* Metric 2 */}
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center group hover:border-teal-500/30 transition-all">
                        <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{consistencyData?.health?.bugFixRatio || 0}%</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bug Fix Ratio</div>
                      </div>
                      {/* Metric 3 */}
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center group hover:border-teal-500/30 transition-all">
                        <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{consistencyData?.health?.featureRatio || 0}%</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">New Features</div>
                      </div>
                      {/* Metric 4 */}
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center group hover:border-teal-500/30 transition-all">
                        <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{consistencyData?.health?.refactorRatio || 0}%</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Refactors</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Achievements & Export */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Achievements */}
                  <div className="md:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Earned Badges
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {consistencyData?.badges && consistencyData.badges.length > 0 ? (
                        consistencyData.badges.map(badge => (
                          <div key={badge.id} className="flex items-center gap-3 p-3 bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl shadow-inner border border-yellow-500/30">
                              {badge.name.includes('Fire') ? '🔥' : badge.name.includes('King') ? '👑' : badge.name.includes('Owl') ? '🌙' : '⭐'}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-yellow-100">{badge.name}</div>
                              <div className="text-[10px] text-yellow-500/70 uppercase max-w-[120px] truncate">{badge.description}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm p-4 w-full text-center border border-dashed border-gray-700 rounded-xl">
                          No badges earned yet. Keep coding!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Export/Alerts */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Actions
                      </h3>

                      <button
                        onClick={() => navigate('/user/profilecard')}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                      >
                        <Share2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        <span className="font-bold text-sm text-gray-300 group-hover:text-white">Share Profile</span>
                      </button>
                    </div>
                    {(consistencyData?.warnings ?? 0) > 0 && (
                      <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <div>
                          <div className="font-bold text-red-400 text-sm">Action Needed</div>
                          <div className="text-xs text-red-300/70">{consistencyData?.warnings} warnings detected.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </>
            )}
          </main>
        </div>
      </div>

      {/* Share Profile Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row">

            <button
              onClick={() => {
                setShowShareModal(false);
                if (window.location.pathname === '/user/profilecard') {
                  navigate('/user');
                }
              }}
              className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Left: Preview */}
            <div className="p-8 flex-1 flex flex-col items-center justify-center bg-slate-950/50 border-r border-white/10 perspective-[1000px]">
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Preview</h3>

              <div
                className={`relative w-[340px] transition-transform duration-700 ease-in-out [transform-style:preserve-3d] cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                style={{ aspectRatio: '9/16' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Face */}
                <div
                  id="codepulse-card"
                  className="absolute inset-0 w-full h-full bg-slate-900 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl select-none [backface-visibility:hidden]"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: "url('/profilecard.jpg')" }}
                  />

                  {/* Overlay Gradient for contrast */}
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                  {/* Content Overlay */}
                  {/* Content Overlay */}
                  <div className="relative h-full w-full flex flex-col z-10 p-6 justify-center">

                    {/* Top Left Label */}
                    <div className="absolute top-6 left-6 flex flex-col items-start leading-none opacity-80">
                      <span className="text-white font-bold text-xs tracking-wider">Codepulse</span>
                      <span className="text-gray-400 font-light text-[10px] tracking-[0.2em] uppercase">CARD</span>
                    </div>

                    {/* Avatar & Identity */}
                    <div className="flex flex-col items-center mt-4 w-full">
                      <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] shadow-2xl">
                          <div className="w-full h-full rounded-full bg-[#1a1a2e] overflow-hidden border-4 border-[#0F0F1A]">
                            {user?.avatar ? (
                              <img src={user.avatar} crossOrigin="anonymous" alt="avatar" className="w-full h-full object-cover" />
                            ) : user?.avatarId !== undefined ? (
                              <img
                                src={[
                                  '',
                                  '/assets/avtar/icons8-minecraft-grass-cube-50.png',
                                  '/assets/avtar/icons8-minecraft-logo-50.png',
                                  '/assets/avtar/icons8-minecraft-logo-50-2.png',
                                  '/assets/avtar/icons8-minecraft-main-character-50.png',
                                  '/assets/avtar/icons8-minecraft-main-character-50-2.png'
                                ][user.avatarId || 1] || ''}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-4xl text-white">
                                {user?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Minecraft Badge */}
                        <div className="absolute 0 bottom-1 right-0 w-8 h-8 bg-[#1a1a1a] rounded-full border-2 border-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-lg z-20">
                          <img src="/minecraft_22400.png" alt="badge" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-1 justify-center w-full">
                        <h2 className="text-xl font-bold text-white text-center">{user?.fullName || user?.username}</h2>
                        <CheckCircle className="w-4 h-4 text-green-500 fill-current" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                        @{user?.username || 'coder'}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3 w-full mt-8">
                      {/* Commits Card */}
                      <div className="bg-[#18181b]/90 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center relative shadow-xl border border-white/5 overflow-hidden group">
                        <div className="absolute top-0 w-8 h-[2px] bg-orange-500 rounded-full"></div>
                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-1">Total Commits</span>
                        <span className="text-3xl font-black text-white font-sans">{consistencyData?.totalCommits || 0}</span>
                      </div>

                      {/* Status Card */}
                      <div className="bg-[#18181b]/90 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center relative shadow-xl border border-white/5 overflow-hidden">
                        <div className="absolute top-0 w-8 h-[2px] bg-green-500 rounded-full"></div>
                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-1">Current Status</span>
                        <span className="text-xl font-black text-white mt-1">
                          {activityStatus.status}
                        </span>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="mt-8 w-full flex flex-col items-center gap-4">
                      {/* Socials */}
                      <div className="w-full bg-[#18181b]/80 backdrop-blur-md p-3 rounded-xl text-center border border-white/5">
                        <p className="text-gray-500 text-[9px] font-bold mb-3 uppercase tracking-wider op-60">You can find me on ...</p>
                        <div className="flex justify-center gap-6 text-gray-400">
                          <Activity className="w-5 h-5 hover:text-green-400 transition-colors cursor-pointer" />
                          <GitBranch className="w-5 h-5 hover:text-purple-400 transition-colors cursor-pointer" />
                          <span className="font-mono font-bold text-sm hover:text-orange-400 transition-colors cursor-pointer">&lt;/&gt;</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap justify-center gap-2 w-full px-2">
                        {['#JAVA', '#REACT', '#DSA', '#NODE'].map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-gray-400 bg-[#27272a] px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
                  <img src="/backofprofile.jpg" alt="back" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="p-8 w-full md:w-[400px] bg-[#0d0d0d] flex flex-col items-center justify-center text-center relative border-l border-white/5">

              {/* Sticker Graphic */}
              <div className="mb-6 relative">
                <img src="/Bee Sticker by Warner Bros. Pictures.gif" alt="mascot" className="w-48 h-48 object-contain drop-shadow-2xl" />
              </div>

              <h3 className="text-gray-400 font-medium mb-1">Share your</h3>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                <span className="text-white">#Code</span><span className="text-orange-500">pulse</span>Card
              </h2>
              <p className="text-gray-500 text-sm mb-8 font-medium">with friends and recruiters</p>

              <div className="w-full space-y-4">
                {/* Action Buttons Row */}
                <div className="flex items-center gap-3 w-full">
                  {/* Download Button */}
                  <button
                    onClick={async () => {
                      setDownloading(true);
                      const element = document.getElementById('codepulse-card');
                      if (element) {
                        try {
                          // Clone the element to capture it without 3D transforms/rotation
                          const clone = element.cloneNode(true) as HTMLElement;
                          clone.style.transform = 'none'; // Force flat
                          clone.style.position = 'fixed'; // Fixed to avoid scrolling affecting it
                          clone.style.left = '-9999px';
                          clone.style.top = '0';
                          clone.style.zIndex = '-1000';
                          clone.style.width = '340px'; // Enforce width
                          clone.style.height = '604px'; // Enforce height (9/16 ratio)
                          clone.style.borderRadius = '32px'; // Ensure radius is kept
                          document.body.appendChild(clone);

                          const canvas = await html2canvas(clone, {
                            scale: 2,
                            useCORS: true,
                            backgroundColor: null,
                            width: 340,
                            height: 604
                          });

                          document.body.removeChild(clone);

                          const link = document.createElement('a');
                          link.download = `codepulse-${user?.username}-card.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                        } catch (err) { console.error(err); }
                      }
                      setDownloading(false);
                    }}
                    disabled={downloading}
                    className="flex-1 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {downloading ? <span className="animate-spin text-sm">⌛</span> : <span>Download</span>}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  {/* Secondary Actions */}
                  <button className="p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded-lg border border-white/5 transition-colors">
                    <LinkIcon className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded-lg border border-white/5 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>

                {/* Separator */}
                <div className="w-full border-t border-white/5 my-4"></div>

                {/* LinkedIn Share */}
                <button
                  onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`, '_blank')
                  }}
                  className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20">
                  <Linkedin className="w-5 h-5 fill-current" />
                  <span>Share on LinkedIn!</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
