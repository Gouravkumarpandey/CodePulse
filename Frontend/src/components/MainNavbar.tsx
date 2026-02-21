import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MainNavbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isHomePage = location.pathname === '/';

    const scrollToSection = (e: React.MouseEvent<any>, id: string) => {
        e.preventDefault();
        if (isHomePage) {
            const element = document.getElementById(id.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Navigate home and then scroll
            navigate(`/${id}`);
            // Small timeout to allow the browser to complete navigation before scrolling
            setTimeout(() => {
                const element = document.getElementById(id.replace('#', ''));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-50 backdrop-blur-sm bg-opacity-90" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/logo.jpg" alt="Codepulse Logo" className="h-20 w-auto" style={{ maxHeight: '80px' }} />
                        </div>
                        <div className="hidden lg:flex items-center space-x-6">
                            <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="text-black dark:text-white hover:underline transition-colors">Features</a>
                            <a href="#how-it-works" onClick={(e) => scrollToSection(e, '#how-it-works')} className="text-black dark:text-white hover:underline transition-colors">How It Works</a>
                            <a href="#open-source" onClick={(e) => scrollToSection(e, '#open-source')} className="text-black dark:text-white hover:underline transition-colors">Open Source</a>
                            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="text-black dark:text-white hover:underline transition-colors">Privacy</a>
                            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="text-black dark:text-white hover:underline transition-colors">Terms</a>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/user')}
                                className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black px-5 py-2.5 rounded-lg font-semibold transition-all"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="text-black dark:text-white hover:underline font-medium transition-colors">Log in</button>
                                <button onClick={() => navigate('/signup')} className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black px-5 py-2.5 rounded-lg font-semibold transition-all">
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-black dark:text-white hover:text-gray-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 absolute w-full left-0 top-16 shadow-lg z-50">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900" onClick={(e) => scrollToSection(e, '#features')}>Features</a>
                        <a href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900" onClick={(e) => scrollToSection(e, '#how-it-works')}>How It Works</a>
                        <a href="#open-source" className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900" onClick={(e) => scrollToSection(e, '#open-source')}>Open Source</a>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => { navigate(user?.role === 'ADMIN' ? '/admin' : '/user'); setIsMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
                                >
                                    Dashboard
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">Log in</button>
                                    <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gray-100 dark:bg-gray-900 text-black dark:text-white">Get Started</button>
                                </>
                            )}
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex gap-4 px-3">
                            <a href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:underline" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate('/privacy'); }}>🔒 Privacy Policy</a>
                            <a href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:underline" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate('/terms'); }}>📋 Terms of Service</a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default MainNavbar;
