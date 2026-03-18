import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import RulesForm from '@/components/admin/RulesForm';
import { api } from '@/services/api';
import { AdminRule } from '@/types/rule';
import { Shield, RefreshCw, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

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
      setSettings(response.data.data?.settings || response.data.settings);
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
      <div className="min-h-screen admin-github-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-github-bg flex font-sans text-white">
      <Sidebar role="admin" />
      <main className={`flex-1 p-8 transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="max-w-5xl mx-auto space-y-8">
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
                  World Rules
                </h1>
                <p className="text-gray-200 mt-2 font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Configure world-wide detection thresholds
                </p>
              </div>
            </div>
            <button
              onClick={loadSettings}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Rules
            </button>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-slate-900/50">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Configuration Panel</h2>
            </div>
            <div className="p-8">
              {settings ? (
                <RulesForm
                  initialSettings={settings}
                  onSave={handleSaveSettings}
                />
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 p-8 text-center rounded-xl">
                  <p className="text-red-400 font-bold uppercase tracking-widest text-lg">Rules File Not Found</p>
                </div>
              )}
            </div>
          </div>

          {/* Help Block */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <h4 className="text-blue-400 text-lg font-bold uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>System Insight</h4>
            </div>
            <p className="text-gray-300 text-sm font-medium leading-relaxed">
              These rules define how CodePulse handles forensic analysis of participant behavior.
              Reducing the <span className="text-white font-bold">Commit Interval</span> will increase detection sensitivity, while
              increasing <span className="text-white font-bold">Grace Period</span> provides more leniency before automatic flag increments.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
