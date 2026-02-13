import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import UsersTable from '@/components/admin/UsersTable';
import { api } from '@/services/api';
import {
  Users, Search, Filter, Download,
  ArrowLeft, RefreshCw, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
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
      <div className="min-h-screen admin-github-bg flex items-center justify-center font-['Minecraftia']">
        <div className="mc-panel p-10 flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 border-8 border-black border-t-[#5da045] animate-spin" />
          <p className="text-xl font-bold text-[#404040] mc-text-shadow-light uppercase tracking-widest">Loading World...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-github-bg p-6 font-['Minecraftia']">
      <div className="flex">
        <Sidebar role="admin" />

        <main className={`flex-1 p-6 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="mc-header p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/admin')}
                  className="mc-button p-4 border-4"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-4xl font-bold text-white mc-text-shadow uppercase tracking-widest">Player Directory</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-3 h-3 bg-[#5da045] border-2 border-black" />
                    <p className="text-[#aaaaaa] text-xs font-bold uppercase tracking-widest">{users.length} PLAYERS DETECTED</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={loadUsers} className="mc-button h-16 px-6 border-4">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button className="mc-button mc-button-primary h-16 px-8 border-4 uppercase text-xs font-black">
                  <Download className="w-5 h-5" />
                  EXPORT DATABASE
                </button>
              </div>
            </header>

            {/* Filter Panel */}
            <div className="mc-panel p-1 shadow-2xl">
              <div className="bg-[#404040] p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#aaaaaa]" />
                  <input
                    type="text"
                    placeholder="FIND BY NAME OR EMAIL..."
                    className="mc-input w-full pl-14 pr-6 py-4 text-lg border-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">Filter:</span>
                  <select
                    className="mc-input py-4 pr-10 text-xs border-4 min-w-[200px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">ALL ENTITIES</option>
                    <option value="active">SURVIVAL (ACTIVE)</option>
                    <option value="warning">CREATIVE (WARNING)</option>
                    <option value="disqualified">SPECTATOR (BANNED)</option>
                  </select>
                </div>

                <button className="mc-button h-16 px-8 border-4 uppercase text-xs font-black">
                  <Filter className="w-5 h-5" />
                  MORE
                </button>
              </div>
            </div>

            {/* Main World Table */}
            <div className="mc-panel p-1 shadow-2xl">
              <div className="bg-[#c6c6c6]">
                <UsersTable users={filteredUsers} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;
