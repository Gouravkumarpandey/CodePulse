import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ email, password });

            if (response.user.role !== 'ADMIN') {
                setError('Access Denied. You do not have administrator privileges.');
                setLoading(false);
                return;
            }

            login(response.user, response.token);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-white">
            {/* LEFT SIDE - Hero Image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://images4.alphacoders.com/133/thumb-1920-1333795.jpeg)',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40" />

                <div className="relative z-10 flex flex-col p-16 h-full justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group self-start"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                    </button>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-xl"
                    >
                        <h1 className="text-6xl font-black mb-6 tracking-tight leading-tight" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                            Admin<br />Portal
                        </h1>
                        <p className="text-xl text-gray-300 font-medium leading-relaxed border-l-4 border-blue-500 pl-6">
                            Restricted access. Monitoring command center for Codepulse operations.
                        </p>
                    </motion.div>

                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
                            Secure Environment
                        </div>
                        <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
                            v2.4.0
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">
                {/* Mobile Background */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images4.alphacoders.com/133/thumb-1920-1333795.jpeg)' }}
                    />
                    <div className="absolute inset-0 bg-slate-950/90" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                            <Lock className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Access Control</h2>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Verify Administrator Privileges</p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4 mb-8"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium text-red-200">{error}</p>
                        </motion.div>
                    )}

                    {/* EMAIL LOGIN */}
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Email Identity
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner font-bold"
                                    placeholder="admin@codepulse.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Security Key
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner font-bold"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/40 uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Enter Command Center'
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
