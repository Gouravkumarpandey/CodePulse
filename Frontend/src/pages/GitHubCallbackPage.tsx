import { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authenticating with GitHub...');
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      if (calledRef.current) return;
      calledRef.current = true;
      setStatus('error');
      setMessage('GitHub authentication was cancelled or failed');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code || calledRef.current) return;
    calledRef.current = true;

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Prevent code reuse by checking if we've already processed this code
    const processedCode = sessionStorage.getItem('github_code_processed');
    if (processedCode === code) {
      setStatus('success');
      setMessage('GitHub already connected! Redirecting to repository selection...');
      setTimeout(() => navigate('/repo-selection'), 1500);
      return;
    }

    const authenticate = async () => {
      if (calledRef.current && status !== 'loading') return;

      try {
        setMessage('Exchanging code for access token...');

        // Mark this code as processed to prevent reuse
        sessionStorage.setItem('github_code_processed', code);

        // Exchange code for GitHub token via backend
        // Use the /api/auth path as configured in the new structure
        const callbackResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/github/callback?code=${code}`, {
          method: 'GET',
        });

        if (!callbackResponse.ok) {
          const errorData = await callbackResponse.json();
          throw new Error(errorData.message || 'Failed to authenticate with GitHub');
        }

        const callbackData = await callbackResponse.json();

        // LOGGING FOR DEBUGGING
        console.log('GitHub Auth Data Received:', callbackData);

        if (callbackData.status === 'ERROR') {
          throw new Error(callbackData.message || 'Authentication failed');
        }

        console.log('GitHub authentication successful');

        // Extract tokens
        const ghToken = callbackData.data.githubAccessToken;
        const jwtToken = callbackData.data.token;
        const userData = callbackData.data.user;

        if (ghToken) {
          sessionStorage.setItem('github_token', ghToken);
          console.log('GitHub token saved to session storage');
        }

        // CHECK IF LOGIN WAS SUCCESSFUL (Backend returned JWT)
        if (jwtToken && userData) {
          console.log('Login successful via GitHub Callback');
          sessionStorage.setItem('token', jwtToken);
          sessionStorage.setItem('user', JSON.stringify(userData));

          if (login) {
            login(userData, jwtToken);
          }

          setStatus('success');
          setMessage('Logged in successfully! Redirecting...');

          // Use common redirect path
          setTimeout(() => navigate('/user'), 1500);
          return;
        }

        // IF NO TOKEN, PROCEED TO LINKING (Legacy/Manual Flow)
        // Now link the GitHub account to the current user
        setMessage('Linking GitHub account...');

        const token = sessionStorage.getItem('token');

        if (!token) {
          // If we are here, it means backend didn't log us in, and we don't have a local token.
          // This implies a failure in backend logic or a new user flow that requires manual step?
          // But backend `githubCallback` should handle signup/login.
          // So this block might be unreachable if backend is correct, but safe to keep for "Connect" scenarios from Settings page.
          console.error('No JWT token found in sessionStorage');
          throw new Error('You must be logged in to link your GitHub account. Please log in first.');
        }

        console.log('JWT token found (first 20 chars):', token.substring(0, 20));
        console.log('Linking GitHub account with backend...');

        const linkResponse = await fetch(`${import.meta.env.VITE_API_URL}/github/link-account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            githubAccessToken: ghToken,
            githubUser: callbackData.data.githubUser || {}, // Use what backend returned if available
          }),
        });

        if (!linkResponse.ok) {
          const errorData = await linkResponse.json();
          console.error('Link account error response:', errorData);
          throw new Error(errorData.message || 'Failed to link GitHub account');
        }

        const linkData = await linkResponse.json();
        console.log('Link account response:', linkData);

        // Store the new JWT token returned from backend
        if (linkData.data?.token) {
          sessionStorage.setItem('token', linkData.data.token);
          console.log('JWT token updated after GitHub link');
        }

        // Update local user data
        const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          githubAccessToken: ghToken,
          githubId: callbackData.data.githubUser?.githubId || currentUser.githubId,
          githubUsername: callbackData.data.githubUser?.username || currentUser.githubUsername,
        };

        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        // Also update the auth context with the new token
        const newToken = linkData.data?.token || sessionStorage.getItem('token') || '';
        if (login) {
          login(updatedUser, newToken);
        }

        // Set flag for repository selection page
        sessionStorage.setItem('github_token', ghToken);
        sessionStorage.setItem('github_authenticated', 'true');

        // Clear the processed code marker on success
        sessionStorage.removeItem('github_code_processed');

        setStatus('success');
        setMessage('Connected successfully! Redirecting to repository selection...');
        setTimeout(() => navigate('/repo-selection'), 1500);
      } catch (err: any) {
        console.error('GitHub authentication error:', err);
        setStatus('error');
        setMessage(err.message || 'Authentication failed');
        // Clear the processed code marker on error
        sessionStorage.removeItem('github_code_processed');
        setTimeout(() => navigate('/connect-github'), 3000);
      }
    };

    authenticate();
  }, [searchParams, navigate, login]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4"
      style={{ backgroundImage: `url('https://4kwallpapers.com/images/wallpapers/minecraft-game-3840x2160-16737.jpg')` }}
    >
      {/* Subtle Dark Overlay for depth */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 z-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/90 dark:bg-[#23272e]/90 border border-gray-300 dark:border-github-border rounded-2xl shadow-2xl p-12 max-w-md w-full text-center backdrop-blur-md"
      >
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 bg-github-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-github-accent animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-github-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-github-success" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-github-danger/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-github-danger" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-300">
          <Github className="w-4 h-4" />
          <span>GitHub OAuth</span>
        </div>
      </motion.div>
    </div>
  );
}
