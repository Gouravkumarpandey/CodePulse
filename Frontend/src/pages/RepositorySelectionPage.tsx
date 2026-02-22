import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Zap, CheckCircle, Star, GitFork, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { unlinkGithubAccount } from '@/services/github.service';


import Sidebar from '@/components/layout/Sidebar';


import { useAuth } from '@/hooks/useAuth';

interface ApiError {
  response?: {
    status?: number;
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


import { useSidebar } from '@/context/SidebarContext';

function RepositorySelectionPage() {
  // Per-tab session: clear sessionStorage on new tab open

  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { collapsed } = useSidebar();
  // Ensure github_token is only for the current user
  useEffect(() => {
    // On mount, check if the stored github_token belongs to the current user
    const storedUser = sessionStorage.getItem('user');
    const githubToken = sessionStorage.getItem('github_token');
    if (githubToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // If the user changes, remove the github_token
        if (!user || (parsedUser && user._id !== parsedUser._id)) {
          sessionStorage.removeItem('github_token');
        }
      } catch {
        sessionStorage.removeItem('github_token');
      }
    }
  }, [user]);
  // Removed unused selectedPlatform state
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repoLoading, setRepoLoading] = useState(true); // Start as true for initial load
  const [showRepoList, setShowRepoList] = useState(false);
  const [connecting, setConnecting] = useState<number | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [githubLinked, setGithubLinked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRepositories = useCallback(async () => {
    setRepoLoading(true);
    try {
      // Get GitHub token from sessionStorage
      const githubToken = sessionStorage.getItem('github_token');
      if (!githubToken) {
        setNeedsAuth(true);
        setGithubLinked(false);
        setRepoLoading(false);
        return;
      }

      // Fetch BOTH Github repos and existing connected repos
      const [ghResponse, localResponse] = await Promise.all([
        api.get('/github/repositories', {
          headers: { 'Authorization': `Bearer ${githubToken}` }
        }),
        api.get('/user/repositories')
      ]);

      if (ghResponse.data.status === 'SUCCESS') {
        const ghRepos = ghResponse.data.data?.repositories || [];
        const localRepos = localResponse.data.data?.repositories || localResponse.data.repositories || [];

        // Mark repos as current active if they exist in local list and are active
        const processedRepos = ghRepos.map((ghRepo: any) => {
          const matched = localRepos.find((lr: any) => lr.fullName === ghRepo.full_name);
          return {
            ...ghRepo,
            isActiveInSystem: matched?.isActive || false
          };
        });

        setGithubLinked(true);
        if (processedRepos.length === 0) {
          setNeedsAuth(false);
          setShowRepoList(false);
          setRepoLoading(false);
          return;
        }
        setRepositories(processedRepos);
        setShowRepoList(true);
        setNeedsAuth(false);
        setRepoLoading(false);
      } else {
        setNeedsAuth(true);
        setGithubLinked(false);
        setRepoLoading(false);
      }
    } catch (error: unknown) {
      setGithubLinked(false);
      const apiError = error as ApiError;
      const errorMsg = apiError.response?.data?.message || apiError.message || 'Failed to fetch repositories';
      if (apiError.response?.status === 401 || errorMsg.includes('token')) {
        setNeedsAuth(true);
        setShowRepoList(false);
      }
      setRepoLoading(false);
    }
  }, []);

  // Move handleUnlinkGithub to top-level
  const handleUnlinkGithub = async () => {
    if (!window.confirm('Are you sure you want to unlink your GitHub account?')) return;
    try {
      await unlinkGithubAccount();
      sessionStorage.removeItem('github_token');
      setGithubLinked(false);
      setNeedsAuth(true);
      setShowRepoList(false);
      setRepositories([]);
      alert('GitHub account unlinked successfully.');
    } catch {
      alert('Failed to unlink GitHub account.');
    }
  };

  useEffect(() => {
    // Only fetch after Firebase auth is ready and user is logged in
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to login
        navigate('/login');
        return;
      }
      // User is authenticated, fetch repositories
      fetchRepositories();
    }
  }, [user, loading, fetchRepositories, navigate]);

  const handleConnect = () => {
    // Check if user is logged in first
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Please log in to your CodePulse account first before connecting GitHub.');
      navigate('/login');
      return;
    }

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-github-client-id';
    const redirectUri = encodeURIComponent('http://localhost:5173/github/callback');
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
        sessionStorage.removeItem('github_authenticated');
        sessionStorage.setItem('showDashboardToast', '1');
        setTimeout(() => navigate('/user'), 500);
      } else {
        throw new Error(response.data.message || 'Failed to connect repository');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      alert(apiError.response?.data?.message || apiError.message || 'Failed to connect repository. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  // Filter repositories based on search query
  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen user-dashboard-bg relative">
      <Sidebar role="user" />
      {/* Logo at the top */}
      <div className="w-full flex justify-center items-center py-2 relative z-10">
        <img src="/logo.jpg" alt="Codepulse Logo" className="h-24 w-auto" style={{ maxHeight: '96px' }} />
      </div>
      <div className={`min-h-screen relative z-10 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <main>

          <div className="max-w-5xl mx-auto px-6 py-4">
            {showRepoList && repositories.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white/90 dark:bg-[#161b22]/90 border border-gray-300 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
                  {/* Modal Header */}
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-github-border">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-github-text mb-2">
                      Select a Github Repository
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-github-text-secondary mb-4">
                      Choose a repository to connect. We'll automatically set up webhooks and start tracking activity.
                    </p>
                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#161b22] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredRepositories.length > 0 ? (
                      filteredRepositories.map((repo, index) => (
                        <div
                          key={repo.id}
                          className={`px-8 py-5 flex items-center justify-between bg-white/80 dark:bg-[#23272e]/40 hover:bg-white/95 dark:hover:bg-[#23272e]/60 transition-colors rounded-xl my-3 shadow-md border border-gray-200 dark:border-gray-800 ${index !== filteredRepositories.length - 1 ? 'mb-2' : ''
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {repo.name}
                              </h3>
                              {repo.private && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded border border-yellow-300 dark:border-yellow-700">
                                  Private
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                              {repo.full_name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 font-semibold">
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
                            disabled={connecting === repo.id || (repo as any).isActiveInSystem}
                            className={`ml-4 px-7 py-2 font-bold rounded-lg shadow transition-colors text-base disabled:opacity-50 flex items-center gap-2 border-none ${(repo as any).isActiveInSystem
                              ? 'bg-green-600 cursor-default'
                              : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                              }`}
                          >
                            {connecting === repo.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (repo as any).isActiveInSystem ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Active
                              </>
                            ) : (
                              'Connect'
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
                        No repositories found matching "{searchQuery}"
                      </div>
                    )}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                    Repository Integrations
                  </h2>
                  <p className="text-gray-600 dark:text-github-text-secondary">
                    Connect your Github, Gitlab and Bitbucket repositories to track activity and automate workflows.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center rounded-xl p-8 bg-white/50 dark:bg-[#161b22]/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800"
                >
                  {repoLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-12 h-12 text-github-accent animate-spin mb-4" />
                      <p className="text-gray-600 dark:text-github-text-secondary">
                        Loading repositories...
                      </p>
                    </div>
                  ) : needsAuth ? (
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
                          Connect with GitHub
                        </h3>
                        <p className="text-gray-600 dark:text-github-text-secondary">
                          Authorize CodePulse to access your repositories. We'll automatically set up webhooks and handle all the configuration.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          sessionStorage.setItem('showDashboardToast', '1');
                          handleConnect();
                        }}
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        Connect with GitHub
                      </button>
                      <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 dark:text-github-text-secondary">
                        <CheckCircle className="w-4 h-4" />
                        <span>Secure OAuth authentication</span>
                      </div>
                    </>
                  ) : githubLinked ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="flex items-center gap-3 mb-4">
                        <img src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg" alt="GitHub" className="w-10 h-10" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">GitHub Connected</span>
                      </div>
                      <button
                        onClick={handleUnlinkGithub}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                      >
                        Unlink GitHub Account
                      </button>
                      <p className="text-gray-600 dark:text-github-text-secondary mt-4">You can unlink your GitHub account at any time.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-github-text-secondary">
                        Checking for GitHub connection...
                      </p>
                    </div>
                  )}
                </motion.div>

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
    </div>
  );
}

export default RepositorySelectionPage;


