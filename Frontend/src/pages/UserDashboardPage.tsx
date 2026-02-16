import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  GitCommit,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  ChevronDown,
  Settings,
  Award,
  Zap
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
  const [selectedRepo, setSelectedRepo] = useState<{ _id?: string; id?: string; name: string; owner?: string; isActive?: boolean; lastSync?: string; language?: string } | null>(null);
  const [repositories, setRepositories] = useState<Array<{ _id?: string; id?: string; name: string; owner?: string; isActive?: boolean; lastSync?: string; language?: string }>>([]);
  const [commitTimeline, setCommitTimeline] = useState<Array<{ date: string; commits: number }>>([]);
  const [recentCommits, setRecentCommits] = useState<Commit[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRepositories();
    }
  }, [isAuthenticated]);

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
          aiInsights: summary.aiInsights || 'Loading insights...',
          suggestions: summary.suggestions || [],
          distribution: (summary.distribution?.segments?.reduce((acc: any, seg: { commits?: number }, idx: number) => {
            acc[`quarter${idx + 1}`] = seg.commits || 0;
            return acc;
          }, {} as any)) || { quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0 },
        });
      }

      if (commits.length > 0) {
        setRecentCommits(commits.slice(0, 5));
        const timeline = generateTimelineFromCommits(commits);
        setCommitTimeline(timeline);
      }
    } catch (error) {
      console.error('Failed to load repository analysis:', error);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedRepo) {
      loadRepositoryAnalysis();
    } else {
      setCommitTimeline([]);
      setRecentCommits([]);
    }
  }, [selectedRepo, loadRepositoryAnalysis]);

  const loadRepositories = async () => {
    try {
      const response = await api.get('/user/repositories');
      const repos = response.data.data?.repositories || response.data.repositories || [];
      setRepositories(repos);
      if (repos.length > 0) {
        const activeRepo = repos.find((r: any) => r.isActive);
        setSelectedRepo(activeRepo || repos[0]);
      } else {
        setSelectedRepo(null);
      }
    } catch (error: unknown) {
      console.error('[UserDashboard] Failed to load repositories:', error);
      setRepositories([]);
      setSelectedRepo(null);
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
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityStatus = () => {
    if (!recentCommits.length) return { status: 'Inactive', color: 'red', message: 'No commits found' };

    const lastCommit = recentCommits[0];
    const hoursSinceLastCommit = (new Date().getTime() - new Date(lastCommit.commitDate).getTime()) / 3600000;

    if (hoursSinceLastCommit < 24) {
      return { status: 'Active', color: 'green', message: `Last commit ${formatTimeAgo(lastCommit.commitDate)}` };
    } else if (hoursSinceLastCommit < 72) {
      return { status: 'At Risk', color: 'yellow', message: `Last commit ${formatTimeAgo(lastCommit.commitDate)}` };
    } else {
      return { status: 'Inactive', color: 'red', message: `Last commit ${formatTimeAgo(lastCommit.commitDate)}` };
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Low';
  };

  const activityStatus = getActivityStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentRepoId = selectedRepo?._id || selectedRepo?.id;

  return (
    <div className="min-h-screen user-dashboard-bg flex font-sans text-white overflow-x-hidden">
      <Sidebar role="user" />

      {/* Main Content */}
      <div className={`flex-1 w-full transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="p-4 md:p-8 lg:p-12 overflow-y-auto min-h-screen">
          <main className="max-w-7xl mx-auto space-y-6">
            {/* Top Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  Participant Dashboard
                </h1>
                <p className="text-gray-200 mt-2 font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Track your coding consistency and activity</p>
              </div>

              {/* Repository Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                  className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl hover:border-white/40 transition-all shadow-xl group"
                >
                  <GitBranch className="w-5 h-5 text-blue-300 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Repository</div>
                    <div className="font-bold text-white text-sm">{selectedRepo?.name || 'Select Repo'}</div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {showRepoDropdown && repositories.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900/90 backdrop-blur-2xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-3 border-b border-white/10 bg-white/5">
                      <h3 className="font-bold text-white text-xs tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Your Repositories</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {repositories.map((repo, idx) => {
                        const rId = repo._id || repo.id;
                        return (
                          <button
                            key={`repo-item-${rId || idx}`}
                            onClick={() => {
                              setSelectedRepo(repo);
                              setShowRepoDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 ${currentRepoId === rId ? 'bg-blue-500/20' : ''
                              }`}
                          >
                            <div className="font-semibold text-white">{repo.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{repo.owner}/{repo.name}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-white/10 bg-white/5">
                      <button
                        onClick={() => {
                          navigate('/repo-selection');
                          setShowRepoDropdown(false);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        + Add Repository
                      </button>
                      <button
                        onClick={() => {
                          navigate('/user/settings');
                          setShowRepoDropdown(false);
                        }}
                        className="w-full px-4 py-2 mt-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Manage Repositories
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Section & Coins */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => navigate('/user/settings')}
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 group relative overflow-hidden p-[2px]"
                >
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                    {(user?.avatarId !== undefined) ? (
                      <img
                        src={[
                          '',
                          '/assets/avtar/icons8-minecraft-grass-cube-50.png',
                          '/assets/avtar/icons8-minecraft-logo-50.png',
                          '/assets/avtar/icons8-minecraft-main-character-50.png',
                          '/assets/avtar/icons8-minecraft-main-character-50-2.png'
                        ][user.avatarId]}
                        alt="avatar"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-white font-black text-lg">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                </button>

                {/* Coin Badge */}
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg backdrop-blur-md hover:bg-slate-800 transition-colors cursor-default animate-in fade-in slide-in-from-top-1 duration-500">
                  <img src="/coin-svgrepo-com.svg" className="w-5 h-5 invert dark:invert-0 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" alt="coins" />
                  <span className="text-xs font-black text-yellow-400 tracking-wider shadow-black drop-shadow-md">{user?.coins || 0}</span>
                </div>
              </div>
            </div>

            {!selectedRepo ? (
              /* No Repository Selected */
              <div className="flex items-center justify-center py-20 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl mt-8">
                <div className="text-center max-w-md">
                  <GitBranch className="w-20 h-20 mx-auto mb-6 text-white/20 animate-pulse" />
                  <h2 className="text-2xl font-bold text-white mb-3 tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>No Repository Connected</h2>
                  <p className="text-gray-300 mb-8 font-medium">
                    Connect a GitHub repository to start tracking your code consistency and viewing detailed analytics.
                  </p>
                  <button
                    onClick={() => navigate('/repo-selection')}
                    className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:scale-105"
                    style={{ fontFamily: '"Minecraftia", sans-serif' }}
                  >
                    Connect Repository
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* A. Activity Status Card - MOST IMPORTANT */}
                <div className={`bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-8 border-l-8 ${activityStatus.color === 'green' ? 'border-green-500 shadow-green-500/20' :
                  activityStatus.color === 'yellow' ? 'border-yellow-500 shadow-yellow-500/20' :
                    'border-red-500 shadow-red-500/20'
                  } border shadow-2xl relative overflow-hidden group`}>
                  {/* Background Glow */}
                  <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-20 pointer-events-none rounded-full transition-colors duration-500 ${activityStatus.color === 'green' ? 'bg-green-500' : activityStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-4 rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-110 ${activityStatus.color === 'green' ? 'bg-green-500 shadow-green-500/30' :
                          activityStatus.color === 'yellow' ? 'bg-yellow-500 shadow-yellow-500/30' :
                            'bg-red-500 shadow-red-500/30'
                          }`}>
                          {activityStatus.color === 'green' ? (
                            <CheckCircle className="w-10 h-10 text-white" />
                          ) : (
                            <AlertCircle className="w-10 h-10 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Activity Status</div>
                          <div className="text-5xl font-extrabold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                            {activityStatus.status}
                          </div>
                        </div>
                      </div>
                      <p className="text-xl text-gray-200 font-medium drop-shadow-md">{activityStatus.message}</p>
                    </div>
                    <div className="hidden md:block text-right">
                      <div className={`text-9xl font-black opacity-10 leading-none select-none transition-transform duration-700 group-hover:scale-125 ${activityStatus.color === 'green' ? 'text-green-500' : activityStatus.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                        {activityStatus.color === 'green' ? 'OK' : activityStatus.color === 'yellow' ? '!!' : 'XX'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Layout - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* B. Consistency Score */}
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl group hover:bg-slate-900/50 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Consistency</h3>
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#8b5cf6"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={`${(consistencyData?.score || 0) * 3.51} 351`}
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-extrabold text-white tracking-tighter">{consistencyData?.score || 0}</div>
                          <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Score</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-block px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest border ${(consistencyData?.score || 0) >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        (consistencyData?.score || 0) >= 70 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          (consistencyData?.score || 0) >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                        {getScoreLabel(consistencyData?.score || 0)}
                      </div>
                    </div>
                  </div>

                  {/* C. Last Commit Details */}
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl group hover:bg-slate-900/50 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Last Commit</h3>
                      <GitCommit className="w-5 h-5 text-blue-400" />
                    </div>
                    {recentCommits.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-3 mb-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <Clock className="w-6 h-6 text-blue-400" />
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time Ago</div>
                            <span className="text-2xl font-black text-white">
                              {formatTimeAgo(recentCommits[0].commitDate)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-5 italic font-black text-xl pointer-events-none uppercase">Msg</div>
                          <p className="text-sm font-medium text-gray-200 mb-3 line-clamp-2 leading-relaxed">
                            {recentCommits[0].message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-white/10 rounded font-mono text-[10px] text-blue-300 border border-white/5 shadow-inner">
                              {recentCommits[0].commitSha.substring(0, 7)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                          <GitCommit className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">No commits yet</p>
                      </div>
                    )}
                  </div>

                  {/* D. Quick Stats */}
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl group hover:bg-slate-900/50 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Quick Stats</h3>
                      <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between group/stat p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Commits</span>
                        <span className="text-2xl font-black text-white group-hover/stat:text-blue-400 transition-colors">{consistencyData?.totalCommits || 0}</span>
                      </div>
                      <div className="flex items-center justify-between group/stat p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Gap (hrs)</span>
                        <span className="text-2xl font-black text-white group-hover/stat:text-purple-400 transition-colors">{Math.round(consistencyData?.averageGap || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between group/stat p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Burst Commits</span>
                        <span className="text-2xl font-black text-orange-400 group-hover/stat:scale-110 transition-transform">{consistencyData?.burstCommits || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E. Commit Timeline Graph */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden relative group">
                  {/* Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Commit Timeline</h3>
                      <p className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">Last 7 days activity</p>
                    </div>
                    {commitTimeline.length > 0 && (
                      <div className="text-xs font-black text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 shadow-lg tracking-widest uppercase">
                        {commitTimeline.reduce((sum, day) => sum + day.commits, 0)} TOTAL COMMITS
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    {commitTimeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={commitTimeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
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
                          <Line
                            type="monotone"
                            dataKey="commits"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            dot={{ fill: '#3b82f6', r: 6, strokeWidth: 4, stroke: 'rgba(59, 130, 246, 0.2)' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-48 flex items-center justify-center">
                        <div className="text-center opacity-30">
                          <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>NO DATA AVAILABLE</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* F. Alerts/Warnings & G. Quick Tips - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* F. Alerts/Warnings */}
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>System Alerts</h3>
                    </div>
                    <div className="space-y-4">
                      {consistencyData?.warnings && consistencyData.warnings > 0 ? (
                        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-inner group transition-all hover:bg-yellow-500/20">
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-sm font-black text-yellow-500 uppercase tracking-widest">
                              {consistencyData.warnings} WARNING{consistencyData.warnings > 1 ? 'S' : ''} DETECTED
                            </p>
                            <p className="text-xs text-yellow-200/70 mt-1">Action may be required to maintain grade.</p>
                          </div>
                        </div>
                      ) : null}

                      {consistencyData?.burstCommits && consistencyData.burstCommits > 5 ? (
                        <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 shadow-inner group transition-all hover:bg-orange-500/20">
                          <Zap className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-sm font-black text-orange-500 uppercase tracking-widest">BURST COMMITS DETECTED</p>
                            <p className="text-xs text-orange-200/70 mt-1 font-medium">Try to spread commits more evenly across sessions.</p>
                          </div>
                        </div>
                      ) : null}

                      {!consistencyData?.warnings && (!consistencyData?.burstCommits || consistencyData.burstCommits <= 5) ? (
                        <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 shadow-inner">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-black text-green-500 uppercase tracking-widest">SYSTEM SECURE</p>
                            <p className="text-xs text-green-200/70 mt-1 font-medium">All systems normal. Maintain your current pace!</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* G. Quick Tips */}
                  <div className="bg-gradient-to-br from-indigo-600/60 to-purple-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden group">
                    {/* Particle Effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <Zap className="w-6 h-6 text-yellow-300" />
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Quick Tips</h3>
                    </div>
                    <ul className="space-y-4 text-xs relative z-10">
                      <li className="flex items-start gap-3 group/tip">
                        <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/tip:bg-white/30 transition-colors">
                          <span className="text-yellow-300 font-bold">1</span>
                        </div>
                        <span className="text-gray-100 font-semibold group-hover/tip:text-white transition-colors leading-relaxed">Commit small changes frequently for higher consistency scores.</span>
                      </li>
                      <li className="flex items-start gap-3 group/tip">
                        <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/tip:bg-white/30 transition-colors">
                          <span className="text-yellow-300 font-bold">2</span>
                        </div>
                        <span className="text-gray-100 font-semibold group-hover/tip:text-white transition-colors leading-relaxed">Avoid last-minute pushes - spread your work throughout the session.</span>
                      </li>
                      <li className="flex items-start gap-3 group/tip">
                        <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/tip:bg-white/30 transition-colors">
                          <span className="text-yellow-300 font-bold">3</span>
                        </div>
                        <span className="text-gray-100 font-semibold group-hover/tip:text-white transition-colors leading-relaxed">Write meaningful commit messages to help AI analysis.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* H. Team Contribution (Optional) */}
                {/* Uncomment when team features are ready
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Team Contribution</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">35%</div>
                      <div className="text-sm text-gray-600">Your Share</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">28%</div>
                      <div className="text-sm text-gray-600">Team Avg</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">Alice</div>
                      <div className="text-sm text-gray-600">Top Contributor</div>
                    </div>
                  </div>
                </div>
                */}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
