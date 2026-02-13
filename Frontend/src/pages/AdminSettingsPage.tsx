import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import RulesForm from '@/components/admin/RulesForm';
import { api } from '@/services/api';
import { AdminRule } from '@/types/rule';
import { Shield, Save, RefreshCw, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

import { useSidebar } from '@/context/SidebarContext';

const AdminSettingsPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { collapsed } = useSidebar();
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
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen admin-github-bg flex items-center justify-center font-['Minecraftia']">
        <div className="mc-panel p-10 flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 border-8 border-black border-t-[#5da045] animate-spin" />
          <p className="text-xl font-bold text-[#404040] mc-text-shadow-light uppercase tracking-widest">Loading World Rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-github-bg p-6 font-['Minecraftia']">
      <div className="flex">
        <Sidebar role="admin" />

        <main className={`flex-1 p-6 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
          <div className="max-w-5xl mx-auto space-y-8">
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
                  <h1 className="text-4xl font-bold text-white mc-text-shadow uppercase tracking-widest">World Rules</h1>
                  <p className="text-[#aaaaaa] text-xs font-bold uppercase tracking-widest mt-2">Configure world-wide detection thresholds</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={loadSettings}
                  className="mc-button h-16 px-6 border-4"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="mc-panel p-1 shadow-2xl">
              <div className="bg-[#404040] p-6 border-b-4 border-black flex items-center gap-6">
                <SettingsIcon className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white mc-text-shadow uppercase tracking-widest">Configuration Panel</h2>
              </div>
              <div className="bg-[#c6c6c6] p-10">
                {settings ? (
                  <RulesForm
                    initialSettings={settings}
                    onSave={handleSaveSettings}
                  />
                ) : (
                  <div className="bg-[#e53935]/10 border-4 border-[#e53935] p-10 text-center">
                    <p className="text-[#e53935] font-black uppercase tracking-widest text-xl">Rules File Not Found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Help Block */}
            <div className="mc-panel p-8 bg-[#303030] shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-8 h-8 text-[#58a6ff]" />
                <h4 className="text-[#58a6ff] text-lg font-black uppercase tracking-widest mc-text-shadow">System Insight</h4>
              </div>
              <p className="text-[#aaaaaa] text-sm font-bold uppercase leading-relaxed tracking-wider">
                These rules define how CodePulse handles forensic analysis of participant behavior.
                Reducing the <span className="text-white">Commit Interval</span> will increase detection sensitivity, while
                increasing <span className="text-white">Grace Period</span> provides more leniency before automatic flag increments.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
