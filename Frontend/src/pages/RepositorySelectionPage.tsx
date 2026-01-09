import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Zap, CheckCircle, Star, GitFork, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import Sidebar from '@/components/layout/Sidebar';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

export default function RepositorySelectionPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<'github' | 'gitlab' | 'bitbucket'>('github');
  const [selectedMode, setSelectedMode] = useState<'auto' | 'manual'>('auto');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRepoList, setShowRepoList] = useState(false);
  const [connecting, setConnecting] = useState<number | null>(null);

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/github/repositories');
      if (response.data.success) {
        const repos = response.data.data.repositories || [];
        if (repos.length === 0) {
          alert('No repositories found in your GitHub account. Please create a repository first.');
          navigate('/user');
          return;
        }
        setRepositories(repos);
        setShowRepoList(true);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch repositories:', error);
      const apiError = error as ApiError;
      const errorMsg = apiError.response?.data?.message || apiError.message || 'Failed to fetch repositories';
      alert(`${errorMsg}. Please try authenticating again.`);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const justAuthenticated = sessionStorage.getItem('github_authenticated');
    if (justAuthenticated === 'true') {
      fetchRepositories();
      sessionStorage.removeItem('github_authenticated');
    }
  }, [fetchRepositories]);

  const handleConnect = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-github-client-id';
    const redirectUri = encodeURIComponent(window.location.origin + '/github-callback');
    const scope = encodeURIComponent('repo user');
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleSelectRepository = async (repo: Repository) => {
    setConnecting(repo.id);
    try {
      const response = await api.post('/github/connect-repo', {
        repoId: repo.id.toString(),
        repoName: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        private: repo.private,
        language: repo.language,
        description: repo.description,
      });

      if (response.data.success) {
        // Clear the authentication flag
        sessionStorage.removeItem('github_authenticated');
        
        // Show success message
        alert('Repository connected successfully! Redirecting to dashboard...');
        
        // Navigate to user dashboard
        setTimeout(() => navigate('/user'), 500);
      } else {
        throw new Error(response.data.message || 'Failed to connect repository');
      }
    } catch (error: unknown) {
      console.error('Failed to connect repository:', error);
      const apiError = error as ApiError;
      alert(apiError.response?.data?.message || apiError.message || 'Failed to connect repository. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
      <Sidebar role="user" />
      
      <main className="ml-64 min-h-screen">
        <header className="bg-white dark:bg-github-canvas-subtle border-b border-gray-200 dark:border-github-border">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-github-text">Integrations</h1>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {showRepoList && repositories.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white dark:bg-github-canvas-subtle border border-gray-200 dark:border-github-border rounded-lg overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-github-border">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-github-text mb-2">
                    Select a Github Repository
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-github-text-secondary">
                    Choose a repository to connect. We'll automatically set up webhooks and start tracking activity.
                  </p>
                </div>

                {/* Repository List */}
                <div className="max-h-[500px] overflow-y-auto">
                  {repositories.map((repo, index) => (
                    <div
                      key={repo.id}
                      className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-github-canvas-inset transition-colors ${
                        index !== repositories.length - 1 ? 'border-b border-gray-100 dark:border-github-border' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-medium text-gray-900 dark:text-github-text">
                            {repo.name}
                          </h3>
                          {repo.private && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded border border-yellow-300 dark:border-yellow-700">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-github-text-secondary mb-2">
                          {repo.full_name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-github-text-secondary">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSelectRepository(repo)}
                        disabled={connecting === repo.id}
                        className="ml-4 px-6 py-2 bg-white dark:bg-github-canvas-subtle border border-gray-300 dark:border-github-border text-gray-700 dark:text-github-text rounded-md hover:bg-gray-50 dark:hover:bg-github-canvas-inset transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {connecting === repo.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-github-canvas-inset border-t border-gray-200 dark:border-github-border flex items-center justify-between">
                  <button
                    onClick={() => setShowRepoList(false)}
                    className="text-sm text-gray-600 dark:text-github-text-secondary hover:text-gray-900 dark:hover:text-github-text transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected to GitHub! Select a repository to integrate.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-github-text mb-2">
                  Repository Integrations
                </h2>
                <p className="text-gray-600 dark:text-github-text-secondary">
                  Connect your Github, Gitlab and Bitbucket repositories to track activity and automate workflows.
                </p>
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setSelectedPlatform('github')}
                  className={`px-6 py-2.5 rounded-lg border font-medium transition-all ${
                    selectedPlatform === 'github'
                      ? 'bg-white dark:bg-github-canvas-subtle border-gray-900 dark:border-github-border text-gray-900 dark:text-github-text shadow-sm'
                      : 'bg-white dark:bg-github-canvas-inset border-gray-200 dark:border-github-border text-gray-600 dark:text-github-text-secondary hover:border-gray-300 dark:hover:border-github-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg" 
                      alt="GitHub" 
                      className="w-5 h-5"
                    />
                    Github
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedPlatform('bitbucket')}
                  className={`px-6 py-2.5 rounded-lg border font-medium transition-all ${
                    selectedPlatform === 'bitbucket'
                      ? 'bg-white dark:bg-github-canvas-subtle border-gray-900 dark:border-github-border text-gray-900 dark:text-github-text shadow-sm'
                      : 'bg-white dark:bg-github-canvas-inset border-gray-200 dark:border-github-border text-gray-600 dark:text-github-text-secondary hover:border-gray-300 dark:hover:border-github-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Bitbucket
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedPlatform('gitlab')}
                  className={`px-6 py-2.5 rounded-lg border font-medium transition-all ${
                    selectedPlatform === 'gitlab'
                      ? 'bg-white dark:bg-github-canvas-subtle border-gray-900 dark:border-github-border text-gray-900 dark:text-github-text shadow-sm'
                      : 'bg-white dark:bg-github-canvas-inset border-gray-200 dark:border-github-border text-gray-600 dark:text-github-text-secondary hover:border-gray-300 dark:hover:border-github-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    GitLab
                  </div>
                </button>
              </div>

              <div className="flex border-b border-gray-200 dark:border-github-border mb-12">
                <button
                  onClick={() => setSelectedMode('auto')}
                  className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                    selectedMode === 'auto'
                      ? 'border-gray-900 dark:border-github-text text-gray-900 dark:text-github-text'
                      : 'border-transparent text-gray-600 dark:text-github-text-secondary hover:text-gray-900 dark:hover:text-github-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Auto Integration
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                      Recommended
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedMode('manual')}
                  className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                    selectedMode === 'manual'
                      ? 'border-gray-900 dark:border-github-text text-gray-900 dark:text-github-text'
                      : 'border-transparent text-gray-600 dark:text-github-text-secondary hover:text-gray-900 dark:hover:text-github-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                    Manual Integration
                  </div>
                </button>
              </div>

              {selectedMode === 'auto' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-12 h-12 text-github-accent animate-spin mb-4" />
                      <p className="text-gray-600 dark:text-github-text-secondary">
                        Loading repositories...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-8 mb-12">
                        <div className="w-24 h-24 rounded-full bg-amber-600 flex items-center justify-center">
                          <GitBranch className="w-12 h-12 text-white" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                        </div>
                        
                        <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                          <img 
                            src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg" 
                            alt="GitHub" 
                            className="w-16 h-16"
                          />
                        </div>
                      </div>

                      <div className="max-w-md mx-auto mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-github-text mb-3">
                          Quick Connect with Github
                        </h3>
                        <p className="text-gray-600 dark:text-github-text-secondary">
                          Authorize GitInfo to access your repositories. We'll automatically set up webhooks and handle all the configuration.
                        </p>
                      </div>

                      <button
                        onClick={handleConnect}
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        Connect with Github
                      </button>

                      <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 dark:text-github-text-secondary">
                        <CheckCircle className="w-4 h-4" />
                        <span>Secure OAuth authentication</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {selectedMode === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="bg-white dark:bg-github-canvas-subtle border border-gray-200 dark:border-github-border rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-github-text mb-4">
                      Manual Repository Configuration
                    </h3>
                    <p className="text-gray-600 dark:text-github-text-secondary mb-6">
                      Manually configure webhook settings and provide repository access.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-github-text mb-2">
                          Repository URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://github.com/username/repository"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-github-border rounded-lg bg-white dark:bg-github-canvas-inset text-gray-900 dark:text-github-text focus:ring-2 focus:ring-blue-500 dark:focus:ring-github-accent-emphasis focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-github-text mb-2">
                          Access Token
                        </label>
                        <input
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-github-border rounded-lg bg-white dark:bg-github-canvas-inset text-gray-900 dark:text-github-text focus:ring-2 focus:ring-blue-500 dark:focus:ring-github-accent-emphasis focus:border-transparent"
                        />
                      </div>
                      
                      <button className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                        Connect Repository
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      More info? Check FAQ
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Auto integration is recommended for faster setup and automatic webhook configuration.
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
