import { useState, useContext, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // Check if user has GitHub connected
        const hasGithub = user?.githubId || user?.githubAccessToken;
        if (!hasGithub) {
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


  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      login(response.user, response.token);

      // Store GitHub token if user has it connected
      if (response.githubAccessToken) {
        sessionStorage.setItem('github_token', response.githubAccessToken);
        console.log('GitHub token restored from login');
      }

      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // Check if user has GitHub connected
        const githubToken = response.githubAccessToken || sessionStorage.getItem('github_token');
        if (!githubToken) {
          navigate('/connect-github');
        } else {
          navigate('/user');
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login failed. No credential returned.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await authService.googleAuth(credentialResponse.credential);
      login(response.user, response.token);
      if (response.githubAccessToken) {
        sessionStorage.setItem('github_token', response.githubAccessToken);
      }
      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        const githubToken = response.githubAccessToken || sessionStorage.getItem('github_token');
        navigate(githubToken ? '/user' : '/connect-github');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Google login failed.';
      setError(message);
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
              <img src="/logo.jpg" alt="Codepulse Logo" className="w-48 h-48 object-contain mb-4" />
              {/* <h2 className="text-3xl font-bold text-black dark:text-white mb-1">Sign in</h2> */}
              <p className="text-black dark:text-white text-lg">Welcome back! Please sign in to continue</p>
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white hover:opacity-70 transition-opacity"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-black dark:bg-white opacity-20" />
            <span className="mx-4 text-xs text-black dark:text-white opacity-60 font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-black dark:bg-white opacity-20" />
          </div>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed. Please try again.')}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="400"
            />
          </div>

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
      </div >
    </div >
  );
}

