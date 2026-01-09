import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import RepoCard from '@/components/user/RepoCard';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { api } from '@/services/api';
import { Repository, GitHubRepository } from '@/types/repository';

const UserSettingsPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const loadRepositories = async () => {
    try {
      const response = await api.get('/user/repositories');
      setRepos(response.data.repositories);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchGitHubRepos = async () => {
    try {
      const response = await api.get('/github/repositories');
      setGithubRepos(response.data.repositories);
      setShowAddModal(true);
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error);
    }
  };

  const connectRepository = async (repoId: number, repoName: string) => {
    try {
      await api.post('/github/connect-repo', { repoId, repoName });
      setShowAddModal(false);
      loadRepositories();
    } catch (error) {
      console.error('Failed to connect repository:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
      <Sidebar role="user" isCollapsed={sidebarCollapsed} />
      
      <main className={`min-h-screen p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-github-text">Repository Settings</h1>
                <p className="text-gray-600 dark:text-github-text-secondary mt-2">Manage your connected repositories</p>
              </div>

              <Button onClick={fetchGitHubRepos} variant="primary">
                + Add Repository
              </Button>
            </div>

            {loadingData ? (
              <div>Loading repositories...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map((repo) => (
                  <RepoCard key={repo._id} repo={repo} />
                ))}
              </div>
            )}

            <Modal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              title="Add Repository"
            >
              <div className="space-y-4">
                {githubRepos.map((repo) => (
                  <div key={repo.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-semibold">{repo.name}</div>
                      <div className="text-sm text-gray-600">{repo.description || 'No description'}</div>
                    </div>
                    <Button
                      onClick={() => connectRepository(repo.id, repo.name)}
                      variant="primary"
                      size="sm"
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </Modal>
          </div>
      </main>
    </div>
  );
};

export default UserSettingsPage;
