import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Clock,
  GitBranch,
  CheckCircle,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/common/Card';
import { api } from '@/services/api';
import { ConsistencyAnalysis } from '@/types';

// Custom tooltip component for theme-aware tooltips
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-[#c9d1d9] mb-1">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm text-gray-600 dark:text-[#8b949e]">
            <span style={{ color: entry.color }}>{entry.name}: {entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [consistencyData, setConsistencyData] = useState<ConsistencyAnalysis | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<{ _id: string; name: string; owner?: string; isActive?: boolean; lastSync?: string } | null>(null);
  const [repositories, setRepositories] = useState<Array<{ _id: string; name: string; owner?: string; isActive?: boolean; lastSync?: string }>>([]);
  const [commitTimeline, setCommitTimeline] = useState<Array<{ hour: string; commits: number }>>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    if (!selectedRepo?._id) return;
    
    try {
      const response = await api.get(`/user/activity/${selectedRepo._id}`);
      const summary = response.data.data?.summary || response.data.summary;
      
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

        const commits = response.data.data?.commits || response.data.commits || [];
        if (commits.length > 0) {
          const timeline = generateTimelineData(commits);
          setCommitTimeline(timeline);
        }
      }
    } catch (error) {
      console.error('Failed to load repository analysis:', error);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedRepo) {
      loadRepositoryAnalysis();
    }
  }, [selectedRepo, loadRepositoryAnalysis]);

  const loadRepositories = async () => {
    try {
      const response = await api.get('/user/repositories');
      const repos = response.data.data?.repositories || response.data.repositories || [];
      setRepositories(repos);
      if (repos.length > 0) {
        setSelectedRepo(repos[0]);
      } else {
        // No repositories connected, user should be prompted to connect
        setSelectedRepo(null);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
      // If API fails, still allow user to see the prompt
      setRepositories([]);
      setSelectedRepo(null);
    }
  };

  const generateTimelineData = (commits: Array<{ commitDate: string }>) => {
    const last24Hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      commits: 0,
    }));

    commits.forEach(commit => {
      const hour = new Date(commit.commitDate).getHours();
      if (last24Hours[hour]) {
        last24Hours[hour].commits++;
      }
    });

    return last24Hours;
  };

  const generateConsistencyData = () => {
    // Generate sample consistency data for the chart
    const months = ['Apr 2023', 'May 2023', 'Aug 2015', 'Jan 2027', 'Aug 2018', 'Aug 2017', 'Oct 2011', 'Oct Ubl'];
    return months.map((month, idx) => ({
      date: month,
      score: idx === 3 || idx === 4 ? 2800 : idx === 2 ? 2600 : idx >= 5 ? 3000 : 2400 + Math.random() * 600,
      inactive: idx === 4 || idx === 5 ? 1500 : 0,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="text-gray-900 dark:text-github-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117]">
      {/* Logo at the top */}
      <div className="w-full flex justify-center items-center py-6">
        <img src="/logo.jpg" alt="Codepulse Logo" className="h-20 w-auto" style={{ maxHeight: '80px' }} />
      </div>
      <Sidebar role="user" isCollapsed={sidebarCollapsed} />
      
      <main className={`min-h-screen p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-github-canvas-subtle border border-gray-200 dark:border-github-border rounded-lg hover:bg-gray-50 dark:hover:bg-github-canvas-inset transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-github-text-secondary" />
        </button>
        
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-github-text mb-1">
                  {selectedRepo ? `${selectedRepo.owner || 'Your'}/${selectedRepo.name}` : 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-github-text-secondary">
                  {selectedRepo ? 'Commit Consistency Analysis' : 'Connect GitHub to track work consistency'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedRepo && (
                  <div className="px-4 py-2 bg-white dark:bg-github-canvas-subtle rounded-lg border border-gray-200 dark:border-github-border">
                    <span className="text-xs text-gray-600 dark:text-github-text-secondary">Last Activity: </span>
                    <span className="text-sm text-gray-900 dark:text-github-text font-medium">
                      {selectedRepo.lastSync ? new Date(selectedRepo.lastSync).toLocaleDateString() : 'No activity'}
                    </span>
                  </div>
                )}
                {repositories.length > 1 && (
                  <select
                    value={selectedRepo?._id || ''}
                    onChange={(e) => {
                      const repo = repositories.find(r => r._id === e.target.value);
                      setSelectedRepo(repo || null);
                    }}
                    className="px-4 py-2 bg-white dark:bg-github-canvas-subtle border border-gray-200 dark:border-github-border rounded-lg text-gray-900 dark:text-github-text focus:ring-2 focus:ring-blue-500 dark:focus:ring-github-accent-emphasis"
                  >
                    {repositories.map((repo) => (
                      <option key={repo._id} value={repo._id}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Repos & Consistency Report */}
              <div className="lg:col-span-2 space-y-6">
                {/* Your GitHub Repositories */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-5 h-5 text-gray-600 dark:text-github-text-secondary" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text">Your GitHub Repositories</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repositories.slice(0, 4).map((repo, idx) => (
                      <motion.div
                        key={repo._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-white dark:bg-github-canvas-subtle border border-gray-200 dark:border-github-border rounded-lg hover:border-blue-500 dark:hover:border-github-accent-emphasis transition-colors cursor-pointer"
                        onClick={() => setSelectedRepo(repo)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-blue-600 dark:text-github-accent-emphasis" />
                            <h3 className="font-medium text-gray-900 dark:text-github-text">{repo.name}</h3>
                          </div>
                          {repo.isActive ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-github-canvas-inset border border-github-border" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-github-text-secondary">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>Last Commit: {repo.lastSync ? new Date(repo.lastSync).toLocaleString() : 'Never'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            <span>{Math.floor(Math.random() * 500) + 50} kb</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Consistency Report */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text">
                        Consistent Bcce - Consistency Report
                      </h2>
                    </div>
                    <button className="px-3 py-1 text-sm text-gray-600 dark:text-github-text-secondary border border-gray-200 dark:border-github-border rounded-md hover:bg-gray-100 dark:hover:bg-github-canvas-subtle flex items-center gap-1">
                      View all
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {consistencyData && (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={generateConsistencyData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-[#30363d]" />
                        <XAxis dataKey="date" className="stroke-gray-500 dark:stroke-[#7d8590]" style={{ fontSize: '12px' }} />
                        <YAxis className="stroke-gray-500 dark:stroke-[#7d8590]" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          dot={{ fill: '#22c55e', r: 4 }}
                          name="Score"
                        />
                        {/* Inactive Gap Highlight */}
                        <Area
                          type="monotone"
                          dataKey="inactive"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.3}
                          name="Inactive"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-full bg-red-500/20 border border-red-500/50 rounded px-3 py-2">
                        <span className="text-red-400 font-medium">Inactive, Gap Gap (11 minutes)</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Commit Timeline */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text">Commit Timeline</h2>
                    </div>
                    <button className="px-3 py-1 text-sm text-gray-600 dark:text-github-text-secondary border border-gray-200 dark:border-github-border rounded-md hover:bg-gray-100 dark:hover:bg-github-canvas-subtle flex items-center gap-1">
                      View all
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {commitTimeline.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={commitTimeline}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-[#30363d]" />
                        <XAxis dataKey="hour" className="stroke-gray-500 dark:stroke-[#7d8590]" style={{ fontSize: '11px' }} />
                        <YAxis className="stroke-gray-500 dark:stroke-[#7d8590]" style={{ fontSize: '11px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="commits" fill="#58a6ff" radius={[4, 4, 0, 0]} name="Commits" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-github-text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#58a6ff] rounded" />
                      <span>Find</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 dark:bg-github-text-secondary rounded" />
                      <span>Consistent</span>
                    </div>
                    <span className="ml-auto">400, 1200</span>
                  </div>
                </Card>
              </div>

              {/* Right Column - Product Activity, Alerts, Rule Engine */}
              <div className="space-y-6">
                {/* Character Image */}
                <div className="flex justify-center">
                  <img src="/image/gitcharacter.svg" alt="Git Character" className="w-full h-auto max-w-md" />
                </div>
                
                {/* Product Activity - Circular Chart */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text">Product Activity</h2>
                    </div>
                    <button className="px-3 py-1 text-sm text-gray-600 dark:text-github-text-secondary border border-gray-200 dark:border-github-border rounded-md hover:bg-gray-100 dark:hover:bg-github-canvas-subtle flex items-center gap-1">
                      Actual
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center py-6">
                    {/* Circular Progress */}
                    <div className="relative w-48 h-48 mb-4">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          className="stroke-gray-200 dark:stroke-[#30363d]"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="#22c55e"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 80}`}
                          strokeDashoffset={`${2 * Math.PI * 80 * (1 - (consistencyData?.score || 78) / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-github-text">
                          {consistencyData?.score || 78}/100
                        </span>
                        <span className="text-sm text-gray-600 dark:text-github-text-secondary">Total Activity</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-semibold text-green-500">
                        Consistency {consistencyData?.score || 78}/100
                      </div>
                      <div className="text-sm text-gray-600 dark:text-github-text-secondary mt-1">
                        Good consistency overall
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Alerts & Advice */}
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">Alerts & Advice</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-github-text-secondary">No violations detected today</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-github-text-secondary">No violations detected today</span>
                    </div>

                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-github-text">
                        You were inactive <span className="font-semibold">5 hours</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-github-text-secondary mt-1">
                        Try smaller, frequent coquent commits.
                      </p>
                    </div>

                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-github-text">
                        <span className="text-red-400 font-semibold">Detected</span> to bulk commit <span className="font-semibold">15 hours</span> tries
                      </p>
                      <p className="text-xs text-gray-600 dark:text-github-text-secondary mt-1">
                        Keep to watchman happy!
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Rule Engine */}
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">Rule Engine</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-900 dark:text-github-text">Active</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        <span className="text-gray-600 dark:text-github-text-secondary">Gap &gt; 8 hrs, Violating</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-github-text-secondary mt-1.5" />
                        <span className="text-gray-600 dark:text-github-text-secondary">Gap &gt; 6 htrs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-github-text-secondary mt-1.5" />
                        <span className="text-gray-600 dark:text-github-text-secondary">Bulk commits</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-github-text-secondary mt-1.5" />
                        <span className="text-gray-600 dark:text-github-text-secondary">Flag</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
