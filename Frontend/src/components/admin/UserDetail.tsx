import { User } from '@/types/user';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { Activity, GitCommit, Clock, AlertTriangle, TrendingUp, GitBranch } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface UserDetailProps {
  user: User;
  analysis?: {
    totalCommits: number;
    consistencyScore: number;
    longestGapHours: number;
    averageGapHours: number;
    burstCommits: number;
    warnings: string[];
    violations: string[];
    aiInsight: string;
    timeline: Array<{ date: string; commits: number }>;
    hourlyDistribution: Array<{ hour: string; commits: number }>;
  };
}

const UserDetail: React.FC<UserDetailProps> = ({ user, analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'success' as const, label: 'Excellent' };
    if (score >= 60) return { variant: 'warning' as const, label: 'Monitor' };
    return { variant: 'danger' as const, label: 'Poor' };
  };

  const mockTimeline = [
    { date: 'Week 1', commits: 12 },
    { date: 'Week 2', commits: 18 },
    { date: 'Week 3', commits: 8 },
    { date: 'Week 4', commits: 22 },
    { date: 'Week 5', commits: 15 },
  ];

  const mockHourly = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    commits: Math.floor(Math.random() * 10),
  }));

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}`}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-github-border"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-github-text">{user.username || 'Unknown User'}</h2>
                <p className="text-gray-600 dark:text-github-text-secondary">@{user.githubId || user.username}</p>
                <p className="text-sm text-gray-500 dark:text-github-text-secondary mt-1">{user.email || 'No email provided'}</p>
              </div>
            </div>

            {analysis && (
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.consistencyScore)}`}>
                  {analysis.consistencyScore}
                </div>
                <div className="text-sm text-gray-500 dark:text-github-text-secondary">Consistency Score</div>
                <Badge variant={getScoreBadge(analysis.consistencyScore).variant} className="mt-2">
                  {getScoreBadge(analysis.consistencyScore).label}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-github-border">
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-github-text-secondary mb-1">Repository</h3>
              <p className="text-sm font-medium text-gray-900 dark:text-github-text flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                {user.selectedRepo || 'Not connected'}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-github-text-secondary mb-1">Joined</h3>
              <p className="text-sm font-medium text-gray-900 dark:text-github-text">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-github-text-secondary mb-1">Last Active</h3>
              <p className="text-sm font-medium text-gray-900 dark:text-github-text">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-github-text-secondary mb-1">Total Commits</h3>
              <p className="text-sm font-medium text-gray-900 dark:text-github-text">
                {analysis?.totalCommits || user.totalCommits || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Summary */}
      {analysis && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-github-text-secondary">Total Commits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-github-text mt-1">
                      {analysis.totalCommits}
                    </p>
                  </div>
                  <GitCommit className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-github-text-secondary">Longest Gap</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-github-text mt-1">
                      {analysis.longestGapHours.toFixed(1)}h
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-orange-500 opacity-50" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-github-text-secondary">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-500 mt-1">
                      {analysis.warnings.length}
                    </p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-50" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-github-text-secondary">Violations</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">
                      {analysis.violations.length}
                    </p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-500 opacity-50" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commit Timeline */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-github-accent" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text">
                    Commit Timeline
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analysis.timeline || mockTimeline}>
                    <defs>
                      <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                    <XAxis dataKey="date" stroke="#7d8590" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#7d8590" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        color: '#c9d1d9',
                      }}
                    />
                    <Area type="monotone" dataKey="commits" stroke="#58a6ff" fillOpacity={1} fill="url(#commitGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Hourly Distribution */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-github-accent" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text">
                    Hourly Distribution
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analysis.hourlyDistribution || mockHourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                    <XAxis dataKey="hour" stroke="#7d8590" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#7d8590" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        color: '#c9d1d9',
                      }}
                    />
                    <Bar dataKey="commits" fill="#58a6ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* AI Insights & Warnings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">
                  AI-Generated Insights
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {analysis.aiInsight || 'No AI insights available yet.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Warnings & Violations */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">
                  Warnings & Violations
                </h3>
                <div className="space-y-3">
                  {analysis.violations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Violations</h4>
                      {analysis.violations.map((violation, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{violation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysis.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">Warnings</h4>
                      {analysis.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysis.violations.length === 0 && analysis.warnings.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-github-text-secondary">
                      No warnings or violations detected. Great work!
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {!analysis && (
        <Card>
          <div className="p-8 text-center">
            <Activity className="w-16 h-16 text-gray-300 dark:text-github-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-2">
              No Analysis Available
            </h3>
            <p className="text-gray-500 dark:text-github-text-secondary">
              This user hasn't connected a repository or no commit data is available yet.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserDetail;
