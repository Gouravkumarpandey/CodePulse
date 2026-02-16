import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import UserDetail from '@/components/admin/UserDetail';
import { api } from '@/services/api';
import { User } from '@/types/user';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

import { useSidebar } from '@/context/SidebarContext';

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (authUser?.role !== 'ADMIN') {
        navigate('/user');
      }
    }
  }, [isAuthenticated, authUser, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && authUser?.role === 'ADMIN' && id) {
      loadUserData();
    }
  }, [isAuthenticated, authUser, id]);

  const loadUserData = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      const data = response.data.data || response.data;
      setTargetUser(data.user);
      setAnalysis(data.statistics);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen admin-github-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-github-bg flex font-sans text-white">
      <Sidebar role="admin" />
      <main className={`flex-1 p-8 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Navigation */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  Entity Metadata
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Accessing Data Block: {id?.substring(0, 8)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={loadUserData} className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-xs">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">
                <Download className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>

          {targetUser ? (
            <div className="animate-fade-in-up">
              <UserDetail user={targetUser} analysis={analysis} />
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-32 text-center">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <span className="text-4xl font-black text-red-500">?</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Entity Not Found</h2>
              <p className="text-gray-400 font-medium mb-10 text-lg">The requested data fragment may have been deleted or corrupted.</p>
              <button onClick={() => navigate('/admin/users')} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 uppercase tracking-wider text-sm flex items-center justify-center gap-2 mx-auto">
                <ArrowLeft className="w-4 h-4" />
                Return to Directory
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUserDetailPage;
