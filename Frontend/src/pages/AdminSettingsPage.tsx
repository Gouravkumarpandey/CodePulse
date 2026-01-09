import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RulesForm from '@/components/admin/RulesForm';
import Card from '@/components/common/Card';
import { api } from '@/services/api';
import { AdminRule } from '@/types/rule';

const AdminSettingsPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AdminRule | null>(null);
  const [loadingData, setLoadingData] = useState(true);

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
      loadSettings();
    }
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveSettings = async (updatedSettings: Partial<AdminRule>) => {
    try {
      await api.put('/admin/settings', updatedSettings);
      setSettings(prev => ({ ...prev, ...updatedSettings } as AdminRule));
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-github-text">Global Settings</h1>
              <p className="text-gray-600 dark:text-github-text-secondary mt-2">Configure system-wide rules and thresholds</p>
            </div>

            {settings && (
              <Card>
                <div className="p-6">
                  <RulesForm
                    initialSettings={settings}
                    onSave={handleSaveSettings}
                  />
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
