import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Shield, Lock, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ConnectGitHubPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [connecting, setConnecting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        // Check if GitHub is already connected
        const githubToken = sessionStorage.getItem('github_token');
        if (githubToken) {
            // Already connected, redirect to repo selection
            navigate('/repo-selection');
        }
    }, [navigate]);

    const handleConnectGitHub = () => {
        if (!agreedToTerms) {
            setShowError(true);
            return;
        }
        setShowError(false);
        setConnecting(true);

        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23li4CIJ8ocjZkYyFd';
        const envRedirect = import.meta.env.VITE_GITHUB_REDIRECT_URI;
        const callbackUrl = envRedirect || `${window.location.origin}/github/callback`;
        const redirectUri = encodeURIComponent(callbackUrl);
        const scope = encodeURIComponent('repo user');

        console.log('--- GitHub OAuth Initiation ---');
        console.log('Client ID:', clientId);
        console.log('Redirect URI:', callbackUrl);
        console.log('-------------------------------');

        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    };

    const handleSkip = () => {
        // Store a flag that user skipped GitHub connection
        sessionStorage.setItem('github_skipped', 'true');
        navigate('/user');
    };

    if (loading) {
        return (
            <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                <div className="text-gray-900 text-xl font-semibold">Loading...</div>
            </div>
        );
    }

    return (
        <div
            className="h-screen w-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat overflow-hidden fixed inset-0"
            style={{ backgroundImage: "url('/githubauth.png')" }}
        >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/10 z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Welcome Text */}
                <div className="text-center mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-block mb-4"
                    >
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-3">
                            <img
                                src="https://cdn-icons-png.flaticon.com/256/25/25231.png"
                                alt="GitHub"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        Connect GitHub
                    </h1>
                    <p className="text-base text-gray-100 max-w-md mx-auto drop-shadow-md">
                        Link your GitHub account to track your coding activity and boost productivity
                    </p>
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
                >
                    {/* Content */}
                    <div className="p-6">
                        {/* Trust Badges */}
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200"
                            >
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-black text-xs mb-1">Read-Only Access</h3>
                                <p className="text-xs text-black">We do NOT modify your code</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200"
                            >
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                                    <Lock className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-black text-xs mb-1">Secure OAuth</h3>
                                <p className="text-xs text-black">Your credentials stay safe</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col items-center text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200"
                            >
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-black text-xs mb-1">Privacy First</h3>
                                <p className="text-xs text-black">Never shared with third parties</p>
                            </motion.div>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className={`mb-4 p-3 rounded-xl border-2 transition-all ${showError && !agreedToTerms
                                ? 'bg-red-50 border-red-300'
                                : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <label className="flex items-start cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => {
                                        setAgreedToTerms(e.target.checked);
                                        setShowError(false);
                                    }}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                />
                                <span className="ml-2 text-xs text-gray-700 leading-relaxed">
                                    I understand CodePulse will only have{' '}
                                    <strong className="text-gray-900">read-only access</strong>. CodePulse will <strong className="text-gray-900">NOT</strong>: access secrets, make write operations, share data, or access private info.
                                </span>
                            </label>
                            {showError && !agreedToTerms && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 flex items-center text-red-600 text-xs"
                                >
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Please agree to the terms to continue
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                onClick={handleConnectGitHub}
                                disabled={connecting}
                                className={`w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 ${!agreedToTerms ? 'opacity-60' : ''
                                    }`}
                            >
                                <img 
                                    src="/icons8-github.svg" 
                                    className="w-5 h-5 object-contain" 
                                    alt="GitHub Icon"
                                />
                                {connecting ? 'Connecting...' : 'Connect with GitHub'}
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                onClick={handleSkip}
                                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all border-2 border-gray-300 hover:border-gray-400 text-sm"
                            >
                                Skip for now
                            </motion.button>
                        </div>

                        {/* Info Note */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                        >
                            <p className="text-xs text-blue-900 text-center">
                                <strong>What happens next?</strong> After connecting, you'll select a repository to track.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="mt-4 flex flex-col items-center"
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    <p className="text-xs font-semibold text-white drop-shadow-md">
                        Step 2 of 4: Connect GitHub
                    </p>
                </motion.div>
            </motion.div>

            {/* Cow Walking Gif */}
            <motion.img
                src="/Cow_Walking.gif"
                alt="Walking Cow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute -bottom-16 right-44 w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain z-10 pointer-events-none"
                style={{ imageRendering: 'pixelated' }}
            />

            {/* Hide scrollbar CSS */}
            <style>{`
                .max-h-\\[90vh\\]::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

