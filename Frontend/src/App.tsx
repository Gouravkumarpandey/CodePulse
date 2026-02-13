import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ConnectGitHubPage from '@/pages/ConnectGitHubPage';
import GitHubCallbackPage from '@/pages/GitHubCallbackPage';
import GoogleCallbackPage from '@/pages/GoogleCallbackPage';
import RepositorySelectionPage from '@/pages/RepositorySelectionPage';
import UserDashboardPage from '@/pages/UserDashboardPage';
import UserActivityPage from '@/pages/UserActivityPage';
import UserWarningsPage from '@/pages/UserWarningsPage';
import UserSettingsPage from '@/pages/UserSettingsPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminUserDetailPage from '@/pages/AdminUserDetailPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';

import { SidebarProvider } from '@/context/SidebarContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/connect-github" element={<ConnectGitHubPage />} />
              <Route path="/auth/callback" element={<GitHubCallbackPage />} />
              <Route path="/github/callback" element={<GitHubCallbackPage />} />
              <Route path="/github-callback" element={<GitHubCallbackPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
              <Route path="/repo-selection" element={<RepositorySelectionPage />} />

              {/* User Routes */}
              <Route path="/user" element={<UserDashboardPage />} />
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
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
