import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import HomePage from '@/pages/HomePage';
import ConnectGitHubPage from '@/pages/ConnectGitHubPage';
import GitHubCallbackPage from '@/pages/GitHubCallbackPage';
import RepositorySelectionPage from '@/pages/RepositorySelectionPage';
import UserDashboardPage from '@/pages/UserDashboardPage';
import UserActivityPage from '@/pages/UserActivityPage';
import UserWarningsPage from '@/pages/UserWarningsPage';
import UserSettingsPage from '@/pages/UserSettingsPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminUserDetailPage from '@/pages/AdminUserDetailPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import PublicLayout from '@/components/layouts/PublicLayout';

import { SidebarProvider } from '@/context/SidebarContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Public Routes with Persistent Navbar */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/connect-github" element={<ConnectGitHubPage />} />
              <Route path="/auth/callback" element={<GitHubCallbackPage />} />
              <Route path="/github/callback" element={<GitHubCallbackPage />} />
              <Route path="/github-callback" element={<GitHubCallbackPage />} />
              <Route path="/repo-selection" element={<RepositorySelectionPage />} />

              {/* User Routes */}
              <Route path="/user" element={<Navigate to="/user/hackathon" replace />} />
              <Route path="/user/dashboard" element={<Navigate to="/user/hackathon" replace />} />
              <Route path="/user/overview" element={<UserDashboardPage />} />
              <Route path="/user/hackathon" element={<UserDashboardPage />} />
              <Route path="/user/team" element={<UserDashboardPage />} />
              <Route path="/user/achievements" element={<UserDashboardPage />} />
              <Route path="/user/reports" element={<UserDashboardPage />} />
              <Route path="/user/activity" element={<UserActivityPage />} />
              <Route path="/user/warnings" element={<UserWarningsPage />} />
              <Route path="/user/settings" element={<UserSettingsPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
