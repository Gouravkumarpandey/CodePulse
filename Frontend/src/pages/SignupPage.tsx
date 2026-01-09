import { useState, useContext, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initiateGoogleOAuth } from '../utils/google-auth';
import { authService } from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

/* ---------------- TYPES ---------------- */
type Role = 'USER' | 'ADMIN' | '';

export default function SignupPage() {
  const navigate = useNavigate();

  /* ✅ Safe AuthContext usage */
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('SignupPage must be used inside AuthProvider');
  }

  const { login, isAuthenticated } = authContext;

  /* ---------------- STATE ---------------- */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/repo-selection');
    }
  }, [isAuthenticated, navigate]);

  /* ---------------- HANDLERS ---------------- */
  const handleGoogleSignup = async () => {
    try {
      setError('');
      const result = await initiateGoogleOAuth();
      
      if (result.success && result.idToken) {
        // Send Firebase ID token to backend for verification
        const response = await api.post('/auth/google/firebase', {
          idToken: result.idToken,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
        });
        
        if (response.data.data) {
          login(response.data.data.user, response.data.data.token);
          
          // Redirect based on role
          if (response.data.data.user.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        }
      } else {
        setError(result.error || 'Google authentication failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Google authentication failed');
      } else {
        setError('Google authentication failed');
      }
    }
  };

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select an account type');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup({
        username: name,
        email,
        password,
        role,
      });

      login(response.user, response.token);
      navigate('/repo-selection');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left Side */}
      <div
        className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://github.blog/wp-content/uploads/2020/12/wallpaper_footer_4KUHD_16_9.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
        <div className="relative z-10 flex flex-col p-12 h-full text-white">
          <button
            onClick={() => navigate('/')}
            className="flex items-center mb-8 hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 className="text-4xl font-bold mb-4">Welcome to CodePulse</h2>
            <p className="text-xl text-gray-200 max-w-md">
              Join our community and start tracking your GitHub activity
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <svg className="w-10 h-10 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 className="text-3xl font-bold text-black dark:text-white ml-3">Create Account</h1>
            </div>
            <p className="text-black dark:text-white text-lg">Get started with CodePulse today</p>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black font-semibold py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black dark:border-white"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-black text-black dark:text-white">Or create with email</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-white dark:bg-black border-2 border-red-600 rounded-md p-4 flex items-start mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 mr-3" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email Signup */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-black dark:text-white mb-2">
                Account Type <span className="text-red-600">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                required
              >
                <option value="">Select account type</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-black dark:text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white hover:bg-white dark:hover:bg-black disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-black hover:text-black dark:hover:text-white border-2 border-black dark:border-white font-semibold py-3 px-4 rounded-md transition-all duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Your Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-black dark:text-white">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-black dark:text-white hover:underline font-medium"
            >
              Sign in
            </button>
          </p>

          <p className="mt-6 text-center text-xs text-black dark:text-white">
            By signing up, you agree to our{' '}
            <a href="#" className="text-black dark:text-white hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-black dark:text-white hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
