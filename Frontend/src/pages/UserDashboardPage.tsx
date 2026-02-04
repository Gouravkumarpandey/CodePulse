
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, GitBranch, GitCommit, GitPullRequest, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/services/api';
import { ConsistencyAnalysis } from '@/types';
import { Commit } from '@/types/commit';



export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const [consistencyData, setConsistencyData] = useState<ConsistencyAnalysis | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<{ _id: string; name: string; owner?: string; isActive?: boolean; lastSync?: string; language?: string } | null>(null);
  const [repositories, setRepositories] = useState<Array<{ _id: string; name: string; owner?: string; isActive?: boolean; lastSync?: string; language?: string }>>([]);
  const [commitTimeline, setCommitTimeline] = useState<Array<{ date: string; commits: number }>>([]);
  const [languageData, setLanguageData] = useState<Array<{ name: string; value: number }>>([]);
  const [activityData, setActivityData] = useState<Array<{ day: string; commits: number; additions: number; deletions: number }>>([]);
  const [recentCommits, setRecentCommits] = useState<Commit[]>([]);
  const [totalBranches, setTotalBranches] = useState(0);
  const [totalPRs, setTotalPRs] = useState(0);

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

  const loadGitHubStats = useCallback(async () => {
    if (!selectedRepo) return;

    try {
      // Use branch and PR counts from repository data (stored during sync)
      const branchCount = (selectedRepo as any).branchCount || 0;
      const prCount = (selectedRepo as any).openPRCount || 0;

      setTotalBranches(branchCount);
      setTotalPRs(prCount);

      console.log(`[Dashboard] Loaded GitHub stats - Branches: ${branchCount}, PRs: ${prCount}`);
    } catch (error) {
      console.error('Failed to load GitHub stats:', error);
    }
  }, [selectedRepo]);

  const loadRepositoryAnalysis = useCallback(async () => {
    if (!selectedRepo?._id) return;

    try {
      const response = await api.get(`/user/activity/${selectedRepo._id}`);
      const summary = response.data.data?.summary || response.data.summary;
      const commits = response.data.data?.commits || response.data.commits || [];
      console.log('[Dashboard] Loaded commits:', commits.length);
      console.log('[Dashboard] Consistency data:', summary);

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
          distribution: summary.distribution?.segments?.reduce((acc: Record<string, number>, seg: { commits?: number }, idx: number) => {
            acc[`quarter${idx + 1}`] = seg.commits || 0;
            return acc;
          }, {}) || { quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0 },
        });
      }

      // Process commits for timeline and recent messages
      if (commits.length > 0) {
        setRecentCommits(commits.slice(0, 10));

        // Generate timeline from actual commit data
        const timeline = generateTimelineFromCommits(commits);
        setCommitTimeline(timeline);

        // Generate activity data (last 7 days)
        const activity = generateActivityData(commits);
        setActivityData(activity);
      }

      // Fetch GitHub repo stats for branches and PRs
      await loadGitHubStats();

      // Generate language data from repository info
      if (selectedRepo.language) {
        setLanguageData([
          { name: selectedRepo.language, value: 100 }
        ]);
      }
    } catch (error) {
      console.error('Failed to load repository analysis:', error);
    }
  }, [selectedRepo, loadGitHubStats]);

  useEffect(() => {
    if (selectedRepo) {
      loadRepositoryAnalysis();
    } else {
      // Show placeholder data when no repo is selected
      setCommitTimeline([]);
      setRecentCommits([]);
      setLanguageData([]);
      setActivityData([]);
      setTotalBranches(0);
      setTotalPRs(0);
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
    // Group commits by date (last 7 days)
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

  const generateActivityData = (commits: Commit[]) => {
    // Group by last 7 days with additions/deletions
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        dateStr: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });

    const activityByDate: Record<string, { commits: number; additions: number; deletions: number }> = {};

    commits.forEach(commit => {
      const dateStr = new Date(commit.commitDate).toISOString().split('T')[0];
      if (!activityByDate[dateStr]) {
        activityByDate[dateStr] = { commits: 0, additions: 0, deletions: 0 };
      }
      activityByDate[dateStr].commits += 1;
      activityByDate[dateStr].additions += commit.additions || 0;
      activityByDate[dateStr].deletions += commit.deletions || 0;
    });

    return last7Days.map(({ dateStr, day }) => ({
      day,
      commits: activityByDate[dateStr]?.commits || 0,
      additions: activityByDate[dateStr]?.additions || 0,
      deletions: activityByDate[dateStr]?.deletions || 0
    }));
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const formatCommitMessage = (message: string) => {
    return message.length > 60 ? message.substring(0, 60) + '...' : message;
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

  // Color scheme for charts - More professional palette
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const CHART_COLORS = {
    commits: '#3b82f6',
    additions: '#10b981',
    deletions: '#ef4444'
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <Sidebar role="user" />
      {/* Main Content */}
      <div className="ml-80 flex-1 p-8">
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">Monitor your coding activity and consistency</p>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <img src="/logo.jpg" alt="CodePulse" className="w-8 h-8 object-contain rounded-md" />
                <h2 className="text-xl font-bold text-black tracking-wide">
                  CODEPULSE
                </h2>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => navigate('/user/activity')}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <TrendingUp className="w-5 h-5" />
                  View Activity
                </button>
              </div>
            </div>

            {/* Greeting */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-black mb-1 flex items-center gap-3">
                  Hello, {user?.username || 'Developer'}! <span className="animate-wave text-3xl">👋</span>
                </h2>
                <p className="text-gray-500 font-medium">
                  {getCurrentDate()}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Repository Card */}
            <div className="bg-[#e6f0ff] dark:bg-[#0c2d6b]/40 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all relative group backdrop-blur-sm">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-blue-200 uppercase tracking-wider mb-1">Active Repository</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate mb-1" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  {selectedRepo?.name || 'No repository selected'}
                </h3>
                {selectedRepo?.owner && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">by {selectedRepo.owner}</p>
                )}
              </div>
            </div>

            {/* Total Commits Card */}
            <div className="bg-[#e6fffa] dark:bg-[#084236]/40 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-all relative group backdrop-blur-sm">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-600 rounded-lg shadow-md">
                  <GitCommit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-green-200 uppercase tracking-wider mb-1">Total Commits</p>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  {consistencyData?.totalCommits || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">In this repository</p>
              </div>
            </div>

            {/* Branches Card */}
            <div className="bg-[#f3e8ff] dark:bg-[#341a54]/40 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-all relative group backdrop-blur-sm">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-600 rounded-lg shadow-md">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-purple-200 uppercase tracking-wider mb-1">Branches</p>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  {totalBranches}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active branches</p>
              </div>
            </div>

            {/* Pull Requests Card */}
            <div className="bg-[#fff7ed] dark:bg-[#4a2412]/40 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-all relative group backdrop-blur-sm">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-600 rounded-lg shadow-md">
                  <GitPullRequest className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-orange-200 uppercase tracking-wider mb-1">Pull Requests</p>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  {totalPRs}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Open PRs</p>
              </div>
            </div>
          </div>



          {/* Main Content Grid - 2 Columns */}
          {!selectedRepo ? (
            /* No Repository Selected - Show Connect Prompt */
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm mt-8">
              <div className="text-center max-w-md">
                <GitBranch className="w-20 h-20 mx-auto mb-6 text-gray-200" />
                <h2 className="text-2xl font-bold text-black mb-3">No Repository Connected</h2>
                <p className="text-gray-500 mb-6">
                  Connect a GitHub repository to start tracking your code consistency and viewing detailed analytics.
                </p>
                <button
                  onClick={() => navigate('/repo-selection')}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Connect Repository
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* Left Column - Takes 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Commit Timeline Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-black">Commit Activity</h3>
                      <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                    </div>
                    {commitTimeline.length > 0 && (
                      <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        {commitTimeline.reduce((sum, day) => sum + day.commits, 0)} commits
                      </div>
                    )}
                  </div>

                  {commitTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={commitTimeline}>
                        <defs>
                          <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            color: '#000',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="commits"
                          stroke="#000000"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCommits)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No commit data available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Commit Messages Section */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-black">Recent Commits</h3>
                    {recentCommits.length > 0 && (
                      <button
                        onClick={() => navigate('/user/activity')}
                        className="text-sm text-gray-600 hover:text-black font-medium transition-colors"
                      >
                        View all →
                      </button>
                    )}
                  </div>

                  {recentCommits.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentCommits.map((commit) => (
                        <div
                          key={commit._id}
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                          <div className={`w-2.5 h-2.5 mt-2 rounded-full flex-shrink-0 ${commit.status === 'OK' ? 'bg-green-500' :
                            commit.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {formatCommitMessage(commit.message)}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                              <span className="py-0.5 px-2 bg-gray-100 rounded text-gray-600 font-mono">{commit.commitSha.substring(0, 7)}</span>
                              <span>{commit.author}</span>
                              <span>{formatTimeAgo(commit.commitDate)}</span>
                            </div>
                            {(commit.additions || commit.deletions) && (
                              <div className="flex items-center gap-3 mt-2 text-xs font-bold">
                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">+{commit.additions || 0}</span>
                                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">-{commit.deletions || 0}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No recent commits</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Takes 1/3 width */}
              <div className="space-y-6">
                {/* Language Distribution */}
                {languageData.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-black mb-6">Languages</h3>

                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={languageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {languageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#000000', '#4b5563', '#9ca3af'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value}%`}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            color: '#000',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="mt-4 space-y-3">
                      {languageData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: ['#000000', '#4b5563', '#9ca3af'][index % 3] }}
                            />
                            <span className="text-gray-700 font-medium">{item.name}</span>
                          </div>
                          <span className="text-gray-900 font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Activity Stats */}
                {activityData.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-black mb-6">Code Changes</h3>

                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          dataKey="day"
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            color: '#000',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="additions"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 3 }}
                          name="Additions"
                        />
                        <Line
                          type="monotone"
                          dataKey="deletions"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', r: 3 }}
                          name="Deletions"
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Summary */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <p className="text-xs text-green-800 font-medium mb-1">Added</p>
                        <p className="text-lg font-bold text-green-700">
                          +{activityData.reduce((sum, day) => sum + day.additions, 0)}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <p className="text-xs text-red-800 font-medium mb-1">Deleted</p>
                        <p className="text-lg font-bold text-red-700">
                          -{activityData.reduce((sum, day) => sum + day.deletions, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Repository Selection */}
                {repositories.length > 1 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-black mb-4">Switch Repository</h3>
                    <select
                      value={selectedRepo?._id || ''}
                      onChange={(e) => {
                        const repo = repositories.find(r => r._id === e.target.value);
                        setSelectedRepo(repo || null);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none font-medium appearance-none"
                    >
                      {repositories.map((repo) => (
                        <option key={repo._id || repo.name} value={repo._id}>
                          {repo.owner}/{repo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div >
    </div >
  );
}
