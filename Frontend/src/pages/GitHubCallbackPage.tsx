import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';

export default function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authenticating with GitHub...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('GitHub authentication was cancelled or failed');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Prevent code reuse by checking if we've already processed this code
    const processedCode = sessionStorage.getItem('github_code_processed');
    if (processedCode === code) {
      setStatus('error');
      setMessage('This authorization code has already been used');
      setTimeout(() => navigate('/repo-selection'), 3000);
      return;
    }

    const authenticate = async () => {
      try {
        setMessage('Exchanging code for access token...');
        
        // Mark this code as processed to prevent reuse
        sessionStorage.setItem('github_code_processed', code);
        
        // Exchange code for GitHub token via backend
        const callbackResponse = await fetch(`${import.meta.env.VITE_API_URL}/github/callback?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!callbackResponse.ok) {
          const errorData = await callbackResponse.json();
          throw new Error(errorData.message || 'Failed to authenticate with GitHub');
        }
        
        const callbackData = await callbackResponse.json();
        
        if (callbackData.status !== 'SUCCESS') {
          throw new Error(callbackData.message || 'Authentication failed');
        }

        console.log('GitHub authentication successful');

        // Save GitHub access token to localStorage
        localStorage.setItem('github_token', callbackData.data.githubAccessToken);
        console.log('GitHub authentication successful - Token saved to localStorage');
        console.log('GitHub token (first 20 chars):', callbackData.data.githubAccessToken?.substring(0, 20));

        // Now link the GitHub account to the current user
        setMessage('Linking GitHub account...');
        
        const token = localStorage.getItem('token');
        const linkResponse = await fetch(`${import.meta.env.VITE_API_URL}/github/link-account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            githubAccessToken: callbackData.data.githubAccessToken,
            githubUser: callbackData.data.githubUser,
          }),
        });

        if (!linkResponse.ok) {
          const errorData = await linkResponse.json();
          throw new Error(errorData.message || 'Failed to link GitHub account');
        }

        const linkData = await linkResponse.json();
        
        // Store the new JWT token returned from backend
        if (linkData.data?.token) {
          localStorage.setItem('token', linkData.data.token);
          console.log('JWT token updated after GitHub link');
        }
        
        // Update local user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          githubAccessToken: callbackData.data.githubAccessToken,
          githubId: callbackData.data.githubUser?.githubId,
          username: callbackData.data.githubUser?.username || currentUser.username,
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Also update the auth context with the new token
        const newToken = linkData.data?.token || localStorage.getItem('token') || '';
        if (login) {
          login(updatedUser, newToken);
        }
        
        // Set flag for repository selection page
        sessionStorage.setItem('github_authenticated', 'true');
        
        // Clear the processed code marker on success
        sessionStorage.removeItem('github_code_processed');
        
        setStatus('success');
        setMessage('Successfully authenticated! Redirecting to repository selection...');
        setTimeout(() => navigate('/repo-selection'), 1500);
      } catch (err: any) {
        console.error('GitHub authentication error:', err);
        setStatus('error');
        setMessage(err.message || 'Authentication failed');
        setTimeout(() => navigate('/repo-selection'), 3000);
      }
    };

    authenticate();
  }, [searchParams, navigate, login]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: `url('https://4kwallpapers.com/images/wallpapers/minecraft-game-3840x2160-16737.jpg')` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/70 dark:bg-white/60 z-0" />
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
