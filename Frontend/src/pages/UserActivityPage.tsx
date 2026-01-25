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

  const loadRepositories = async () => {
    try {
      const response = await api.get('/user/repositories');
      setRepos(response.data.repositories);
      if (response.data.repositories.length > 0) {
        setSelectedRepo(response.data.repositories[0]._id);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const loadCommits = async (repoId: string) => {
    setLoadingData(true);
    try {
      const response = await api.get(`/user/activity/${repoId}`);
      setCommits(response.data.commits);
    } catch (error) {
      console.error('Failed to load commits:', error);
    } finally {
      setLoadingData(false);
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
      <div className="absolute inset-0 bg-white/70 dark:bg-white/60 z-0" />
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-github-text">Commit Activity</h1>
                <p className="text-gray-600 dark:text-github-text-secondary mt-2">Track your commit timeline</p>
              </div>

              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Repositories</option>
                {repos.map((repo) => (
                  <option key={repo._id} value={repo._id}>
                    {repo.name}
                  </option>
                ))}
              </select>
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
