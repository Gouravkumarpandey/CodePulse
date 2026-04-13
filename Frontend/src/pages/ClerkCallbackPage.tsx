import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/react';
import { AuthContext } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';

export default function ClerkCallbackPage() {
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const handleClerkAuth = async () => {
      if (!clerkLoaded) return;

      if (!clerkUser) {
        navigate('/');
        return;
      }

      try {
        // Get Clerk token
        const clerkToken = await getToken();

        // Call backend to verify/create user and get their role and GitHub info
        const response = await authService.clerkAuth({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || '',
          avatar: clerkUser.imageUrl || '',
          clerkToken: clerkToken,
        });

        if (authContext) {
          authContext.login(response.user, response.token);

          // Store GitHub token if available
          if (response.githubAccessToken) {
            sessionStorage.setItem('github_token', response.githubAccessToken);
          }

          // Redirect based on role and GitHub connection
          if (response.user.role === 'ADMIN') {
            navigate('/admin');
          } else {
            const githubToken = response.githubAccessToken || sessionStorage.getItem('github_token');
            navigate(githubToken ? '/user' : '/connect-github');
          }
        }
      } catch (error) {
        console.error('Clerk auth callback error:', error);
        navigate('/');
      }
    };

    handleClerkAuth();
  }, [clerkUser, clerkLoaded, getToken, navigate, authContext]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <p className="text-xl text-black dark:text-white" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
        Completing authentication...
      </p>
    </div>
  );
}
