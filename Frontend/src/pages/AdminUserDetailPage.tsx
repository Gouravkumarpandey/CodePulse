import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import UserDetail from '@/components/admin/UserDetail';
import { api } from '@/services/api';
import { User } from '@/types/user';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser, isAuthenticated, loading } = useAuth();
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
      setTargetUser(response.data.user);
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen mc-dirt-bg flex items-center justify-center font-['Minecraftia']">
        <div className="mc-panel p-10 flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 border-8 border-black border-t-[#5da045] animate-spin" />
          <p className="text-xl font-bold text-[#404040] mc-text-shadow-light uppercase tracking-widest">Identifying Entity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mc-dirt-bg p-6 font-['Minecraftia']">
      <div className="flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Navigation */}
            <header className="mc-header p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="mc-button p-4 border-4"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-4xl font-bold text-white mc-text-shadow uppercase tracking-widest">Entity Metadata</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-3 h-3 bg-[#fbc02d] border-2 border-black animate-pulse" />
                    <p className="text-[#aaaaaa] text-xs font-bold uppercase tracking-widest">ACCESSING DATA BLOCK: {id?.substring(0, 8)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="mc-button h-16 px-6 border-4" onClick={loadUserData}>
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button className="mc-button mc-button-primary h-16 px-8 border-4 uppercase text-xs font-black">
                  <Download className="w-5 h-5" />
                  GENERATE REPORT
                </button>
              </div>
            </header>

            {targetUser ? (
              <UserDetail user={targetUser} analysis={analysis} />
            ) : (
              <div className="mc-panel p-32 text-center bg-[#c6c6c6] shadow-2xl">
                <div className="w-24 h-24 bg-[#404040] border-4 border-black border-t-[#e53935] mx-auto mb-8 flex items-center justify-center">
                  <span className="text-4xl font-black text-[#e53935] mt-[-4px]">?</span>
                </div>
                <h2 className="text-3xl font-black text-[#404040] uppercase tracking-widest mc-text-shadow-light">Entity Not Found</h2>
                <p className="text-[#8b8b8b] font-bold uppercase mt-4 mb-10 tracking-widest">The requested data fragment may have been deleted or corrupted.</p>
                <button onClick={() => navigate('/admin/users')} className="mc-button px-10 py-5 border-4 uppercase text-sm font-black">
                  <ArrowLeft className="w-4 h-4" />
                  BACK TO WORLD
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
