import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import CommitTimeline from '@/components/user/CommitTimeline';
import { api } from '@/services/api';
import { Commit } from '@/types/commit';
import { Repository } from '@/types/repository';

const UserActivityPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo && selectedRepo !== 'all') {
      loadCommits(selectedRepo);
    }
  }, [selectedRepo]);

  // Polling for real-time updates
  useEffect(() => {
    if (!selectedRepo || selectedRepo === 'all') return;

    const intervalId = setInterval(() => {
      loadCommits(selectedRepo, true); // true = silent reload
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [selectedRepo]);

  const loadRepositories = async () => {
    try {
      const response = await api.get('/user/repositories');
      const data = response.data;
      const repositories = data.data?.repositories || data.repositories || [];
      setRepos(repositories);
      if (repositories.length > 0) {
        const activeRepo = repositories.find((r: any) => r.isActive);
        setSelectedRepo(activeRepo ? activeRepo._id : repositories[0]._id);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const loadCommits = async (repoId: string, silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      const response = await api.get(`/user/activity/${repoId}`);
      const data = response.data;
      const commits = data.data?.commits || data.commits || [];
      setCommits(commits);
    } catch (error) {
      console.error('Failed to load commits:', error);
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url('https://4kwallpapers.com/images/wallpapers/minecraft-game-3840x2160-16737.jpg')` }}>
      <div className="absolute inset-0 bg-white/70 dark:bg-[#0d1117]/85 z-0" />
      <Sidebar role="user" isCollapsed={sidebarCollapsed} />
      <main className={`min-h-screen p-8 transition-all duration-300 relative z-10 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-github-canvas-subtle border border-gray-200 dark:border-github-border rounded-lg hover:bg-gray-50 dark:hover:bg-github-canvas-inset transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-github-text-secondary" />
        </button>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Commit Activity</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Track your commit timeline</p>
            </div>

            {selectedRepo && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 font-semibold">
                Repository: {repos.find(r => r._id === selectedRepo)?.name || 'Selected'}
              </div>
            )}
          </div>

          {loadingData ? (
            <div>Loading commits...</div>
          ) : (
            <CommitTimeline commits={commits} />
          )}
        </div>
      </main>
    </div>
  );
};

export default UserActivityPage;
