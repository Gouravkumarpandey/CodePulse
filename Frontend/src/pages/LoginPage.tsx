import { useState, useContext, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();

  /* ✅ SAFE CONTEXT USAGE */
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('LoginPage must be wrapped inside AuthProvider');
  }

  const { login, isAuthenticated } = authContext;

  /* ---------------- STATE ---------------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user');
    }
  }, [isAuthenticated, navigate]);

  /* ---------------- HANDLERS ---------------- */
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      // Send the credential token to backend for verification
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();
      if (response.ok && data.data) {
        login(data.data.user, data.data.token);
        navigate(data.data.user.role === 'ADMIN' ? '/admin' : '/user');
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
        navigate('/user');
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
    <div className="min-h-screen bg-white dark:bg-black flex">
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
            <img src="/codepulse-logo.png" alt="Codepulse Logo" className="h-16 w-auto mb-4 mx-auto" style={{ maxHeight: '64px' }} />
              <img src="/logo.jpg" alt="Codepulse Logo" className="h-16 w-auto mb-4 mx-auto" style={{ maxHeight: '64px' }} />
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
            <div className="flex items-center mb-6">
              <img src="/logo.jpg" alt="Codepulse Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-3xl font-bold text-black dark:text-white ml-3">
                Sign in
              </h1>
            </div>
            <p className="text-black dark:text-white text-lg">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="w-full mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
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
