import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  Save,
  X,
  GitBranch,
  Plus,
  Trash2,
  LogOut,
  Key,
  Github,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import AvatarSelector from '@/components/user/AvatarSelector';
import Modal from '@/components/common/Modal';
import { api } from '@/services/api';
import { Repository, GitHubRepository } from '@/types/repository';

import { useSidebar } from '@/context/SidebarContext';

const UserSettingsPage = () => {
  const { user, isAuthenticated, loading, logout, updateUser } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  // State for form fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [teamName, setTeamName] = useState(user?.teamName || '');
  const [avatarId, setAvatarId] = useState(user?.avatarId || 1);

  // Repository state
  const [repos, setRepos] = useState<Repository[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState({
    inactivityAlert: true,
    burstCommitWarning: true,
    emailNotifications: false,
    dailySummary: true
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRepositories();
      // Initialize notification state if user has it
      if (user?.notifications) {
        setNotifications(prev => ({ ...prev, ...user.notifications }));
      }
    }
  }, [isAuthenticated, user]);

  const loadRepositories = async () => {
    try {
      setLoadingRepos(true);
      const response = await api.get('/user/repositories');
      const data = response.data;
      const repositories = data.data?.repositories || data.repositories || [];
      setRepos(repositories);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await api.put('/user/profile', {
        fullName,
        email,
        teamName,
        avatarId,
        notifications
      });

      if (response.data.success) {
        // Update user in context
        // Merge with existing user data
        const updatedUser = {
          ...user,
          fullName,
          email,
          teamName,
          avatarId,
          notifications,
          ...response.data.data?.user
        };
        updateUser(updatedUser as any);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const fetchGitHubRepos = async () => {
    try {
      const response = await api.get('/github/repositories');
      const data = response.data;
      const repositories = data.data?.repositories || data.repositories || [];
      setGithubRepos(repositories);
      setShowAddRepoModal(true);
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error);
    }
  };

  const connectRepository = async (repoId: number, repoName: string) => {
    try {
      await api.post('/github/connect-repo', { repoId, repoName });
      setShowAddRepoModal(false);
      loadRepositories();
    } catch (error) {
      console.error('Failed to connect repository:', error);
    }
  };

  const handleDeleteRepo = async (repoId: string | number) => {
    if (window.confirm('Remove this repository from tracking?')) {
      try {
        await api.delete(`/user/repositories/${repoId}`);
        loadRepositories();
      } catch (error) {
        console.error('Failed to delete repository:', error);
      }
    }
  };

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingAction, setPendingAction] = useState<'deactivate' | 'delete' | null>(null);

  const handleInitiateAction = async (action: 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) return;
      } else {
        if (!window.confirm('Are you sure you want to deactivate your account?')) return;
      }

      setPendingAction(action);
      await api.post('/user/otp');
      setShowOtpModal(true);
      setOtp('');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  const handleConfirmOtp = async () => {
    try {
      if (pendingAction === 'deactivate') {
        await api.post('/user/deactivate', { otp });
        alert('Account deactivated.');
        logout();
      } else if (pendingAction === 'delete') {
        await api.delete('/user', { data: { otp } });
        alert('Account deleted.');
        logout();
      }
      setShowOtpModal(false);
    } catch (error: any) {
      console.error('Action failed:', error);
      alert(error.response?.data?.message || 'Verification failed. Invalid OTP.');
    }
  };

  const avatars = [
    { id: 1, name: 'Grass Cube', path: '/assets/avtar/icons8-minecraft-grass-cube-50.png' },
    { id: 2, name: 'Minecraft Logo', path: '/assets/avtar/icons8-minecraft-logo-50.png' },
    { id: 3, name: 'Steve', path: '/assets/avtar/icons8-minecraft-main-character-50.png' },
    { id: 4, name: 'Steve Alt', path: '/assets/avtar/icons8-minecraft-main-character-50-2.png' },
  ];

  const currentAvatar = avatars.find(a => a.id === avatarId) || avatars[0];

  if (loading) {
    return (
      <div className="min-h-screen user-dashboard-bg flex items-center justify-center">
        <div className="text-white font-bold uppercase tracking-widest text-xl">Loading Settings...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen user-dashboard-bg flex font-sans text-white overflow-x-hidden">
      <Sidebar role="user" />

      {/* Main Content */}
      <div className={`flex-1 w-full transition-all duration-500 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="p-4 md:p-8 lg:p-12 overflow-y-auto min-h-screen">
          <main className="max-w-4xl mx-auto space-y-12">

            {/* Page Header */}
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: '"Minecraftia", sans-serif' }}
              >
                Control Panel
              </motion.h1>
              <p className="text-gray-200 mt-2 font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                Manage your profile, repositories and notification preferences
              </p>
            </div>

            {/* 1. Profile Information */}
            <section className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-4">
                <UserIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-bold uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Profile Information</h2>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  {/* Avatar Picker */}
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className={`w-32 h-32 rounded-2xl bg-white/5 flex items-center justify-center p-6 shadow-2xl ring-4 ring-white/10 hover:ring-blue-500/50 transition-all transform hover:scale-105 group relative overflow-hidden`}
                    >
                      <img src={currentAvatar.path} alt={currentAvatar.name} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                    </button>
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="text-xs font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                    >
                      Change Avatar
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">GitHub Username</label>
                      <div className="relative">
                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={user?.username || ''}
                          readOnly
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-400 cursor-not-allowed font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Team Name</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                        placeholder="Rocket League"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setFullName(user?.fullName || '');
                      setEmail(user?.email || '');
                      setTeamName(user?.teamName || '');
                      setAvatarId(user?.avatarId || 1);
                    }}
                    className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                  >
                    {saving ? 'Saving...' : saveSuccess ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Repository Settings */}
            <section className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                  <h2 className="text-lg font-bold uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Repository Settings</h2>
                </div>
                <button
                  onClick={fetchGitHubRepos}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-white/10"
                >
                  <Plus className="w-4 h-4" /> Add Repo
                </button>
              </div>

              <div className="p-8">
                {loadingRepos ? (
                  <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-20 bg-white/5 rounded-xl w-full"></div>
                    <div className="h-20 bg-white/5 rounded-xl w-full"></div>
                  </div>
                ) : repos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repos.map((repo) => (
                      <div key={repo.id || repo._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:border-white/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${repo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'}`}>
                            <Github className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{repo.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{repo.isActive ? '• Currently Tracked' : 'Not active'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!repo.isActive && (
                            <button
                              onClick={() => api.post('/user/active-repository', { repoId: repo._id }).then(loadRepositories)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                              title="Activate"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRepo(repo._id || (repo as any).id);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-sm font-medium">No repositories tracked yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Notifications & Alerts */}
            <section className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-4">
                <Bell className="w-6 h-6 text-yellow-400" />
                <h2 className="text-lg font-bold uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Notifications & Alerts</h2>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-white">Inactivity Alert</div>
                    <div className="text-xs text-gray-400 mt-0.5">Alert me before violations occur.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.inactivityAlert}
                      onChange={(e) => setNotifications({ ...notifications, inactivityAlert: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-white">Burst Commit Warning</div>
                    <div className="text-xs text-gray-400 mt-0.5">Warn when too many commits in a burst.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.burstCommitWarning}
                      onChange={(e) => setNotifications({ ...notifications, burstCommitWarning: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-white">Email Notifications</div>
                    <div className="text-xs text-gray-400 mt-0.5">Receive alerts directly in your inbox.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-white">Daily Activity Summary</div>
                    <div className="text-xs text-gray-400 mt-0.5">Recap of your daily performance.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.dailySummary}
                      onChange={(e) => setNotifications({ ...notifications, dailySummary: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* 4. Account & Security */}
            <section className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-4">
                <Shield className="w-6 h-6 text-red-400" />
                <h2 className="text-lg font-bold uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Account & Security</h2>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all gap-3 group">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform"><Key className="w-6 h-6" /></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-center">Change Password</span>
                </button>
                <button
                  onClick={() => navigate('/connect-github')}
                  className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all gap-3 group"
                >
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 transition-transform"><Github className="w-6 h-6" /></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-center">Reconnect GitHub</span>
                </button>
                <button
                  onClick={() => handleInitiateAction('deactivate')}
                  className="flex flex-col items-center justify-center p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl hover:bg-orange-500/20 hover:border-orange-500/40 transition-all gap-3 group text-orange-400"
                >
                  <div className="p-3 bg-orange-500/20 text-orange-500 rounded-xl group-hover:scale-110 transition-transform"><LogOut className="w-6 h-6" /></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-center">Deactivate</span>
                </button>
                <button
                  onClick={() => handleInitiateAction('delete')}
                  className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 hover:border-red-500/40 transition-all gap-3 group text-red-400"
                >
                  <div className="p-3 bg-red-500/30 text-red-500 rounded-xl group-hover:scale-110 transition-transform"><Trash2 className="w-6 h-6" /></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-center">Delete Account</span>
                </button>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Modals */}
      <AvatarSelector
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarId={avatarId}
        onSelect={(id) => setAvatarId(id)}
      />

      <Modal
        isOpen={showAddRepoModal}
        onClose={() => setShowAddRepoModal(false)}
        title="Add New Repository"
      >
        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {githubRepos.length > 0 ? (
            githubRepos.map((repo) => (
              <div key={repo.id} className="p-4 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-slate-700 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-bold text-white truncate">{repo.name}</div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{repo.full_name}</div>
                </div>
                <button
                  onClick={() => connectRepository(repo.id, repo.name)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Connect
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No GitHub repositories found.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Security Verification"
      >
        <div className="mt-4 space-y-6">
          <p className="text-gray-300 text-sm">
            Please enter the 6-digit One Time Password (OTP) sent to your registered email address to confirm this action.
          </p>
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500/50"
              placeholder="000000"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowOtpModal(false)}
              className="flex-1 py-3 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmOtp}
              disabled={otp.length !== 6}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default UserSettingsPage;
