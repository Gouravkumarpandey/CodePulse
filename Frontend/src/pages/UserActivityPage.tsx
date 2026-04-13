import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import CommitTimeline from '@/components/user/CommitTimeline';
import { api } from '@/services/api';
import { Commit } from '@/types/commit';
import { Repository } from '@/types/repository';

import { useSidebar } from '@/context/SidebarContext';

const UserActivityPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(true);

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
        const repo = activeRepo || repositories[0];
        setSelectedRepo(repo._id || repo.id);
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
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar role="user" />
      <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>

        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Commit Activity</h1>
              <p className="text-zinc-400 mt-2">Track your commit timeline</p>
            </div>

            {selectedRepo && (
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-semibold text-sm">
                Repository: {repos.find((r: any) => (r._id === selectedRepo || r.id === selectedRepo))?.name || 'Selected'}
              </div>
            )}
          </div>

          {loadingData ? (
            <div className="text-zinc-400 text-center py-20">Loading commits...</div>
          ) : (
            <CommitTimeline commits={commits} />
          )}
        </div>
      </main>
    </div>
  );
};

export default UserActivityPage;
