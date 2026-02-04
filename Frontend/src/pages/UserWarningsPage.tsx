import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, XCircle, ShieldAlert, CheckCircle2, TrendingDown, Clock, GitCommit, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import WarningList from '@/components/user/WarningList';
import Card from '@/components/common/Card';
import { api } from '@/services/api';
import { Commit } from '@/types/commit';

const UserWarningsPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState<Commit[]>([]);
  const [violations, setViolations] = useState<Commit[]>([]);
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
      const repos = await api.get('/user/repositories');

      const allCommits: Commit[] = [];
      for (const repo of repos.data.repositories) {
        const response = await api.get(`/user/activity/${repo._id}`);
        allCommits.push(...response.data.commits);
      }

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

  const getStatusColor = () => {
    if (violations.length > 0) return 'red';
    if (warnings.length > 0) return 'yellow';
    return 'green';
  };

  const getStatusMessage = () => {
    if (violations.length > 0) return 'Critical Issues Detected';
    if (warnings.length > 0) return 'Attention Required';
    return 'All Clear';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalIssues = violations.length + warnings.length;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url('https://4kwallpapers.com/images/wallpapers/minecraft-game-3840x2160-16737.jpg')` }}>
      <div className="absolute inset-0 bg-white/70 dark:bg-[#0d1117]/85 z-0" />
      <Sidebar role="user" />
      <main className="ml-72 min-h-screen p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                Alerts & Violations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Monitor and manage your development consistency alerts
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-[#161b22]/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${getStatusColor() === 'red' ? 'bg-red-500 animate-pulse' :
                getStatusColor() === 'yellow' ? 'bg-yellow-500 animate-pulse' :
                  'bg-green-500'
                }`} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {getStatusMessage()}
              </span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {violations.length}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Violations
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Critical issues requiring immediate attention
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {warnings.length}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Warnings
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Potential issues to monitor
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {totalIssues}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Total Issues
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Combined alerts detected
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {totalIssues === 0 ? '100%' : Math.max(0, 100 - (totalIssues * 10)) + '%'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Compliance Rate
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Overall consistency score
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-[#161b22]/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-sm"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#161b22]'
                  }`}
              >
                All Issues ({totalIssues})
              </button>
              <button
                onClick={() => setActiveTab('violations')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'violations'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#161b22]'
                  }`}
              >
                Violations ({violations.length})
              </button>
              <button
                onClick={() => setActiveTab('warnings')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'warnings'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#161b22]'
                  }`}
              >
                Warnings ({warnings.length})
              </button>
            </div>
          </motion.div>

          {/* Content Section */}
          {loadingData ? (
            <Card>
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
              </div>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {/* Violations Section */}
              {(activeTab === 'all' || activeTab === 'violations') && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Critical Violations
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {violations.length} serious compliance issues detected
                        </p>
                      </div>
                    </div>

                    {violations.length > 0 ? (
                      <WarningList items={violations} type="violation" />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No Violations Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Great job! You're maintaining excellent development consistency.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Warnings Section */}
              {(activeTab === 'all' || activeTab === 'warnings') && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Active Warnings
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {warnings.length} areas requiring attention
                        </p>
                      </div>
                    </div>

                    {warnings.length > 0 ? (
                      <WarningList items={warnings} type="warning" />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No Warnings Active
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          All clear! Keep up the consistent development pace.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Best Practices Card */}
              {totalIssues > 0 && (
                <Card>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Improvement Recommendations
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <Clock className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span>Maintain regular commit intervals to avoid large gaps</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <GitCommit className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span>Break down work into smaller, frequent commits</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <TrendingDown className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span>Avoid bulk commits that may indicate inconsistent development patterns</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserWarningsPage;
