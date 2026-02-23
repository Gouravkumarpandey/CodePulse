import { useState, useContext, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';


/* ---------------- TYPES ---------------- */
type Role = 'USER' | 'ADMIN' | '';

export default function SignupPage() {
  const navigate = useNavigate();

  /* ✅ Safe AuthContext usage */
  /* ✅ Safe AuthContext usage */
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('SignupPage must be used inside AuthProvider');
  }

  const { login, isAuthenticated, loading: authLoading, user } = authContext;

  /* ---------------- STATE ---------------- */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        // Check if user has GitHub connected
        const hasGithub = user?.githubId || user?.githubAccessToken;
        if (!hasGithub) {
          navigate('/connect-github');
        } else {
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

  /* ---------------- HANDLERS ---------------- */
  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const assignedRole = email === 'kumarpandeygourav@gmail.com' ? 'ADMIN' : 'USER';

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Auto-assign role, remove validation for empty role

    setLoading(true);

    try {
      const response = await authService.signup({
        username: name,
        email,
        password,
        role: assignedRole,
      });

      login(response.user, response.token);
      navigate('/connect-github');
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
    <div className="min-h-screen bg-white dark:bg-black flex" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
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
            {/* Logo removed as requested */}
            <p className="text-xl text-gray-200 max-w-md text-center">
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
            <div className="flex flex-col items-center mb-6">
              <img src="/logo.jpg" alt="Codepulse Logo" className="w-48 h-48 object-contain mb-4" />
              <h1 className="text-3xl font-bold text-black dark:text-white mb-1">Create Account</h1>
              <p className="text-black dark:text-white text-lg">Get started with CodePulse today</p>
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
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-sans"
                  placeholder="Your Name"
                  required
                />
              </div>
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
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-sans"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-sans"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-md text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-sans"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
