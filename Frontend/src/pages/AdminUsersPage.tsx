import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Search, Users, Download, RefreshCw, Filter } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import UsersTable from '@/components/admin/UsersTable';
import Card from '@/components/common/Card';
import { api } from '@/services/api';
import { User } from '@/types/user';

const AdminUsersPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'good' | 'warning' | 'violation'>('all');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isAuthenticated, user]);

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=10`);
      setUsers(response.data.users);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting user data...');
    // Implement export functionality
  };

  const handleRefresh = () => {
    loadUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.githubId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.selectedRepo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'good' && (user.consistencyScore || 0) >= 80) ||
      (statusFilter === 'warning' && (user.warnings || 0) > 0 && (user.violations || 0) === 0) ||
      (statusFilter === 'violation' && (user.violations || 0) > 0);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-github-bg">
      <div className="text-github-text">Loading...</div>
    </div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-github-bg">
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-github-text">User Management</h1>
                <p className="text-github-text-secondary mt-2">
                  Monitor and analyze all registered users' development consistency
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-github-canvas-subtle border border-github-border text-github-text rounded-md hover:bg-github-canvas-inset transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-github-accent-emphasis text-white rounded-md hover:bg-github-accent-emphasis/90 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-github-text-secondary">Total Users</p>
                      <p className="text-2xl font-bold text-github-text mt-1">{total}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-500 opacity-50" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-github-text-secondary">Good Status</p>
                      <p className="text-2xl font-bold text-green-500 mt-1">
                        {users.filter(u => (u.consistencyScore || 0) >= 80).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-github-text-secondary">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-500 mt-1">
                        {users.filter(u => (u.warnings || 0) > 0).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚠</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-github-text-secondary">Violations</p>
                      <p className="text-2xl font-bold text-red-500 mt-1">
                        {users.filter(u => (u.violations || 0) > 0).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✕</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-github-text-secondary w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email, GitHub ID, or repository..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-github-canvas-subtle border border-github-border rounded-md text-github-text placeholder-github-text-secondary focus:ring-2 focus:ring-github-accent-emphasis focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-github-text-secondary" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="px-4 py-2 bg-github-canvas-subtle border border-github-border rounded-md text-github-text focus:ring-2 focus:ring-github-accent-emphasis"
                    >
                      <option value="all">All Status</option>
                      <option value="good">Good (80+)</option>
                      <option value="warning">Warnings</option>
                      <option value="violation">Violations</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Users Table */}
            {loadingData ? (
              <Card>
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-accent-emphasis mx-auto"></div>
                  <p className="text-github-text-secondary mt-4">Loading users...</p>
                </div>
              </Card>
            ) : (
              <>
                <UsersTable users={filteredUsers} />
                
                {/* Pagination */}
                <Card>
                  <div className="p-4 flex justify-between items-center">
                    <div className="text-sm text-github-text-secondary">
                      Showing <span className="font-medium text-github-text">{filteredUsers.length}</span> of{' '}
                      <span className="font-medium text-github-text">{total}</span> users
                      {searchTerm && ` (filtered from ${users.length} users)`}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-github-canvas-subtle border border-github-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-github-canvas-inset transition-colors text-github-text"
                      >
                        Previous
                      </button>
                      <div className="px-4 py-2 bg-github-canvas-subtle border border-github-border rounded-md text-github-text">
                        Page {page}
                      </div>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * 10 >= total}
                        className="px-4 py-2 bg-github-canvas-subtle border border-github-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-github-canvas-inset transition-colors text-github-text"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;
