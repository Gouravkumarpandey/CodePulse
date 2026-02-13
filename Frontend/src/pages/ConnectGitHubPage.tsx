import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Shield, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ConnectGitHubPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [connecting, setConnecting] = useState(false);

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
        setConnecting(true);
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-github-client-id';
        const redirectUri = encodeURIComponent('http://localhost:5173/github/callback');
        const scope = encodeURIComponent('repo user');
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    };

    const handleSkip = () => {
        navigate('/user');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-2 overflow-hidden relative" style={{ backgroundImage: "url('https://4kwallpapers.com/images/wallpapers/minecraft-game-3840x2160-16737.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            {/* Subtle Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/40 z-0" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full flex flex-col items-center"
            >
                {/* Welcome Text */}
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-center tracking-wider uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                    Welcome to CodePulse!
                </h1>
                <p className="text-lg md:text-2xl text-white mb-8 text-center tracking-normal font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                    Let's connect your GitHub account to get started
                </p>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    {/* Header with GitHub Logo */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-center">
                        <img
                            src="https://icones.pro/wp-content/uploads/2021/06/icone-github-orange.png"
                            alt="GitHub"
                            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-xl"
                        />
                        <h2 className="text-2xl font-bold text-white mb-1">Connect GitHub</h2>
                        <p className="text-gray-300 text-sm">One-click setup to track your coding activity</p>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Trust Badges - Compact Grid */}
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black text-xs mb-0.5" style={{ color: '#000' }}>Read-Only Access</h3>
                                    <p className="text-xs text-black" style={{ color: '#000' }}>We do NOT modify your code.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black text-xs mb-0.5" style={{ color: '#000' }}>Secure OAuth</h3>
                                    <p className="text-xs text-black" style={{ color: '#000' }}>Your credentials stay safe.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black text-xs mb-0.5" style={{ color: '#000' }}>Privacy First</h3>
                                    <p className="text-xs text-black" style={{ color: '#000' }}>Never shared with third parties.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={handleConnectGitHub}
                                disabled={connecting}
                                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <Github className="w-5 h-5" />
                                {connecting ? 'Connecting...' : 'Connect with GitHub'}
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleSkip}
                                className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all border border-gray-300 text-sm"
                            >
                                Skip for now
                            </button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-gray-500 text-center mt-3">
                            By connecting, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                </div>
                <p className="text-center text-lg md:text-xl text-white font-extrabold mt-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">
                    Step 2 of 4: Connect GitHub
                </p>
            </motion.div>
        </div>
    );
}
