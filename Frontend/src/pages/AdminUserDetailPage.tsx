import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import UserDetail from '@/components/admin/UserDetail';
import { api } from '@/services/api';
import { User } from '@/types/user';

const AdminUserDetailPage = () => {
  const { user: currentUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (currentUser?.role !== 'ADMIN') {
        navigate('/user');
      }
    }
  }, [isAuthenticated, currentUser, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'ADMIN' && id) {
      loadUserDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, currentUser]);

  const loadUserDetail = async () => {
    try {
      // This would need a backend endpoint to get single user
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user detail:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
        <Navbar />
        <div className="flex">
          <Sidebar role="admin" />
          <main className="flex-1 p-8">
            <div>User not found</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-github-text">User Details</h1>
              <p className="text-gray-600 dark:text-github-text-secondary mt-2">View detailed user activity</p>
            </div>

            <UserDetail user={user} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
