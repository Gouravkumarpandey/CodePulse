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
        
        if (!callbackData.success) {
          throw new Error(callbackData.message || 'Authentication failed');
        }

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
        
        // Update local user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          githubAccessToken: callbackData.data.githubAccessToken,
          githubId: callbackData.data.githubUser?.githubId,
          username: callbackData.data.githubUser?.username || currentUser.username,
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Also update the auth context
        if (login) {
          login(updatedUser, token || '');
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
    <div className="min-h-screen bg-github-bg dark:bg-github-canvas-subtle flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-github-canvas-subtle dark:bg-github-canvas-inset border border-github-border rounded-lg p-12 max-w-md w-full text-center"
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

        <h2 className="text-2xl font-bold text-github-text mb-3">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>

        <p className="text-github-text-secondary mb-6">{message}</p>

        <div className="flex items-center justify-center gap-2 text-sm text-github-text-secondary">
          <Github className="w-4 h-4" />
          <span>GitHub OAuth</span>
        </div>
      </motion.div>
    </div>
  );
}
