import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import UsersTable from '@/components/admin/UsersTable';
import { api } from '@/services/api';
import { Search, Filter, Download,
  ArrowLeft, RefreshCw
} from 'lucide-react';

import { useSidebar } from '@/context/SidebarContext';

const AdminUsersPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'ADMIN') {
        navigate('/user');
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [isAuthenticated, user]);

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      const response = await api.get('/admin/users?limit=100');
      // Handle response structure where data is nested in data property
      const userData = response.data.data?.users || response.data.users || [];
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && (u.violations || 0) === 0) ||
      (statusFilter === 'warning' && (u.violations || 0) > 0 && (u.violations || 0) < 3) ||
      (statusFilter === 'disqualified' && (u.violations || 0) >= 3);
    return matchesSearch && matchesStatus;
  });

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
      <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                  Player Directory
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                    {(users as any[]).length} Players Detected
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={loadUsers} className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-xs">
                <RefreshCw className="w-4 h-4" />
                Sync
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 uppercase tracking-wider text-xs">
                <Download className="w-4 h-4" />
                Export DB
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Find by name, email or ID..."
                  className="w-full pl-12 pr-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-white placeholder-gray-500 font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Filter By:</span>
                <select
                  className="bg-slate-800 border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 uppercase tracking-wide min-w-[180px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Entities</option>
                  <option value="active">Survival (Active)</option>
                  <option value="warning">Creative (Warning)</option>
                  <option value="disqualified">Spectator (Banned)</option>
                </select>
              </div>

              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 hover:border-white/20 uppercase tracking-wider text-xs whitespace-nowrap">
                <Filter className="w-4 h-4 inline mr-2" />
                Advanced
              </button>
            </div>
          </div>

          {/* Main User Table */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <UsersTable users={filteredUsers} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
