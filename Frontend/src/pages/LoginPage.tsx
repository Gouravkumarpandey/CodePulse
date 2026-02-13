import { useState, useContext, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { authService } from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();

  /* ✅ SAFE CONTEXT USAGE */
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('LoginPage must be wrapped inside AuthProvider');
  }

  const { login, isAuthenticated, loading: authLoading, user } = authContext;

  /* ---------------- STATE ---------------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // Check if user has GitHub connected
        const githubToken = sessionStorage.getItem('github_token');
        if (!githubToken) {
          // First time user - go to connect GitHub
          navigate('/connect-github');
        } else {
          // Returning user - go to dashboard
          navigate('/user');
        }
      }
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
        <p className="text-xl text-black dark:text-white">Loading...</p>
      </div>
    );
  }

  /* ---------------- HANDLERS ---------------- */
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      setError('Google login failed. Please try again.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Send the credential token to backend for verification
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();
      if (response.ok && data.data) {
        login(data.data.user, data.data.token);
        // Check if user has GitHub connected
        const githubToken = sessionStorage.getItem('github_token');
        if (data.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (!githubToken) {
          navigate('/connect-github');
        } else {
          navigate('/user');
        }
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      login(response.user, response.token);

      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // Check if user has GitHub connected
        const githubToken = sessionStorage.getItem('github_token');
        if (!githubToken) {
          navigate('/connect-github');
        } else {
          navigate('/user');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-white dark:bg-black flex" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
      {/* LEFT SIDE */}
      <div
        className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://user-images.githubusercontent.com/3369400/133268513-5bfe2f93-4402-42c9-a403-81c9e86934b6.jpeg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
        <div className="relative z-10 flex flex-col p-12 h-full">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-gray-200 mb-8 group self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex flex-col justify-center text-white"
          >
            <p className="text-xl text-gray-200 max-w-md">
              Track your GitHub activity and boost productivity
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="flex flex-col items-center mb-6">
              <img src="/logo.jpg" alt="Codepulse Logo" className="w-800000 h-80000 object-contain mb-4" />
              {/* <h2 className="text-3xl font-bold text-black dark:text-white mb-1">Sign in</h2> */}
              <p className="text-black dark:text-white text-lg">Welcome back! Please sign in to continue</p>
            </div>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="w-full mb-6 flex justify-center">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Visual Minecraft-styled layer */}
              <div
                style={{
                  fontFamily: '"Minecraftia", sans-serif',
                  background: '#fff',
                  border: '3px solid #222',
                  color: '#222',
                  padding: '0.9rem 2.2rem',
                  borderRadius: '10px',
                  boxShadow: '4px 4px 0 #222',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  pointerEvents: 'none',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </g>
                </svg>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.5px' }}>Sign in with Google</span>
              </div>

              {/* Invisible actual Google button (handles click/auth) */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0 }}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                />
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* EMAIL LOGIN */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-md font-semibold hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white border-2 border-black dark:border-white disabled:opacity-60 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign in to CodePulse'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-black dark:text-white">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-black dark:text-white font-medium hover:underline"
            >
              Create a free account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
