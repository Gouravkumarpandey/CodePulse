import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  Save,
  GitBranch,
  Plus,
  Trash2,
  LogOut,
  Github,
  CheckCircle2,
  AlertCircle,
  Share2
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
      if (user) {
        setFullName(user.fullName || '');
        setEmail(user.email || '');
        setTeamName(user.teamName || '');
        setAvatarId(user.avatarId || 1);
        if (user.notifications) {
          setNotifications(prev => ({ ...prev, ...user.notifications }));
        }
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
      <div className={`flex-1 w-full transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <div className="p-4 md:p-8 lg:p-8 overflow-y-auto min-h-screen">

          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Profile Card */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
              <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 flex flex-col items-center relative shadow-xl overflow-hidden">
                {/* Header Toggle */}
                <div className="w-full flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" /> Public Profile
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setShowAvatarModal(true)} // Or open full edit modal
                  className="absolute top-20 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Avatar */}
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-blue-500 mb-4">
                  <div className="w-full h-full rounded-full bg-[#18181b] overflow-hidden border-4 border-[#18181b]">
                    {user?.avatar ? (
                      <img src={user.avatar} crossOrigin="anonymous" alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <img src={currentAvatar.path} alt="avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>

                {/* Identity */}
                <h2 className="text-xl font-bold text-white text-center mb-1">{user?.fullName || user?.username}</h2>
                <div className="flex items-center gap-1 text-sm text-blue-400 font-medium mb-6">
                  @{user?.username} <CheckCircle2 className="w-3 h-3 fill-blue-500 text-[#18181b]" />
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate('/user/profilecard')}
                  className="w-full py-3 bg-[#27272a] hover:bg-[#3f3f46] border border-white/5 rounded-xl text-orange-400 font-bold text-xs uppercase tracking-widest transition-all mb-8 shadow-lg"
                >
                  Get your CodePulse Card
                </button>

                {/* Socials & Info */}
                <div className="w-full space-y-4">
                  <div className="flex justify-center gap-4 border-b border-white/5 pb-6">
                    <Github className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                    <GitBranch className="w-5 h-5 text-gray-500 hover:text-purple-400 cursor-pointer transition-colors" />
                    <Share2 className="w-5 h-5 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span>{user?.teamName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <span>Member since 2026</span>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="w-full mt-8 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-l-2 border-orange-500 cursor-pointer">
                    <span className="text-sm font-bold text-white">About</span>
                    <span className="bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded">NEW</span>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer text-gray-400 hover:text-white transition-colors">
                    <span className="text-sm font-medium">Problem Solving Stats</span>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer text-gray-400 hover:text-white transition-colors">
                    <span className="text-sm font-medium">Certifications</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Edit Profile & Repos */}
            <div className="col-span-1 lg:col-span-6 flex flex-col gap-6">

              {/* Edit Profile Form */}
              <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Personal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#27272a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-gray-600"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#27272a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-gray-600"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Team Name</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full bg-[#27272a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-gray-600"
                      placeholder="e.g. The Avengers"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Linked Repositories */}
              <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex-1">
                <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <GitBranch className="w-4 h-4" /> Linked Repositories
                  </h3>
                  <button
                    onClick={fetchGitHubRepos}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {loadingRepos ? (
                    <div className="text-center py-10 text-gray-600 italic text-sm">Loading repos...</div>
                  ) : repos.length > 0 ? (
                    repos.map(repo => (
                      <div key={repo.id} className="group flex items-center justify-between p-3 bg-[#27272a] rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${repo.isActive ? 'bg-green-900/20 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                            <Github className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-200">{repo.name}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              {repo.isActive ? <span className="text-green-500">Active</span> : 'Inactive'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteRepo(repo._id || (repo as any).id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-gray-500 text-xs font-medium">No repositories connected.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Preferences */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">

              {/* Notifications */}
              <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Alerts
                </h3>

                <div className="space-y-4">
                  {/* Toggle Item */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Inactivity Alert</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.inactivityAlert}
                        onChange={(e) => setNotifications({ ...notifications, inactivityAlert: e.target.checked })}
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Burst Warning</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.burstCommitWarning}
                        onChange={(e) => setNotifications({ ...notifications, burstCommitWarning: e.target.checked })}
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Email Notify</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-xl flex-1 relative overflow-hidden">
                <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-red-500 to-red-700"></div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Danger Zone
                </h3>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/connect-github')}
                    className="w-full py-3 bg-[#27272a] hover:bg-slate-700 border border-white/5 rounded-xl text-gray-300 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" /> Reconnect GitHub
                  </button>
                  <button
                    onClick={() => handleInitiateAction('deactivate')}
                    className="w-full py-3 bg-[#27272a] hover:bg-orange-900/20 hover:border-orange-500/30 border border-white/5 rounded-xl text-orange-400 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Deactivate
                  </button>
                  <button
                    onClick={() => handleInitiateAction('delete')}
                    className="w-full py-3 bg-[#27272a] hover:bg-red-900/20 hover:border-red-500/30 border border-white/5 rounded-xl text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals from original code ... */}
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
