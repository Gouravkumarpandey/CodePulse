import React, { createContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/user';
import { authService } from '@/services/auth.service';

import { AuthContext } from './auth-context-instance';
export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authProcessed, setAuthProcessed] = useState(false);

  useEffect(() => {
    // Sync Clerk authentication with local state and backend
    const handleClerkAuth = async () => {
      if (!clerkLoaded) return;

      if (clerkUser && !authProcessed) {
        try {
          // Get Clerk token
          const clerkToken = await getToken();

          // Call backend to verify/create user
          const response = await authService.clerkAuth({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || '',
            avatar: clerkUser.imageUrl || '',
            clerkToken: clerkToken,
          });

          setUser(response.user);
          sessionStorage.setItem('user', JSON.stringify(response.user));
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('clerk_session', 'true');

          // Restore GitHub token from backend response or user object
          const ghToken = response.githubAccessToken || response.user?.githubAccessToken;
          if (ghToken) {
            sessionStorage.setItem('github_token', ghToken);
          }

          // Redirect based on role and GitHub connection
          if (response.user.role === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else {
            // New users (no GitHub) → onboarding; returning users → dashboard
            const hasGitHub = !!(ghToken || response.user?.githubId);
            navigate(hasGitHub ? '/user/hackathon' : '/connect-github', { replace: true });
          }

          setAuthProcessed(true);
        } catch (error) {
          console.error('Error processing Clerk auth:', error);
          setAuthProcessed(true);
        }
      } else if (!clerkUser) {
        // User is not authenticated via Clerk
        setUser(null);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('clerk_session');
        setAuthProcessed(false);
      }

      setLoading(false);
    };

    handleClerkAuth();
  }, [clerkUser, clerkLoaded, getToken, navigate, authProcessed]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('github_token');
    sessionStorage.removeItem('clerk_session');
    setAuthProcessed(false);
    signOut();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
