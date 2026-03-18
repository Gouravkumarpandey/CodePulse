import React, { useState } from 'react';
import MinecraftModeSlider from '../components/MinecraftModeSlider';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const CodePulseHomePage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 100]);
  const yFg = useTransform(scrollY, [0, 500], [0, -50]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">


      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black min-h-screen flex flex-col justify-center pt-10 pb-20 lg:pb-32">
        {/* Background Image - Full Coverage */}
        {/* Background Image - Full Coverage */}
        <motion.div
          className="absolute inset-0"
          style={{ y: yBg, scale: 1.2 }}
        >
          <img
            src="/background1.webp"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Foreground Image */}
        {/* Foreground Image */}
        <motion.div
          className="absolute -bottom-32 left-0 w-full z-0"
          style={{ y: yFg }}
        >
          <img
            src="/Foreground.png"
            alt="Foreground layer"
            className="w-full object-cover"
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Minecraft Themed Hero Block */}
            <div className="flex flex-col items-center justify-center mb-10" style={{ fontFamily: 'Minecraftia, sans-serif' }}>
              <img
                src="/info.png"
                alt="Real-Time Hackathon Monitoring"
                className="mx-auto mb-6 w-full"
                style={{ maxHeight: '600px', maxWidth: '1200px', marginTop: '-4rem', objectFit: 'contain' }}
              />
              <div className="max-w-2xl text-xl md:text-4xl text-white text-center mt-4 md:-mt-20 drop-shadow-md">
                Track commits, activity, and team progress live — all in one dashboard.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#FFD700] hover:bg-[#FFC000] text-black px-10 py-5 rounded-lg text-xl font-bold transition-all shadow-lg hover:shadow-xl border-b-4 border-r-4 border-black active:border-b-2 active:border-r-2 active:translate-y-1 active:translate-x-1"
                style={{ fontFamily: 'Minecraftia, sans-serif' }}
              >
                Let's Explore
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-black dark:border-white">
              <img
                src="https://images.ctfassets.net/8aevphvgewt8/301u29BCKZVbXYLhQR1hu3/16eb65f687a079d79a0255d3ebabfdbb/features-codespaces-hero.webp?w=2496&fm=webp&q=90"
                alt="CodePulse Dashboard"
                className="w-full"
              />
            </div>
          </div>
        </div>

      </section>
      {/* Features Section with River Breakout Image */}
      <section className="py-24 bg-white dark:bg-black" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{
                  fontFamily: 'Minecraftia, sans-serif',
                  color: '#FFD700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
                }}
              >
                REAL-TIME MONITORING
              </h2>
              <p className="text-xl text-black dark:text-white mb-6 leading-relaxed">
                Track GitHub push events in real-time using webhooks. Monitor team activity continuously without interfering with participants' workflows.
              </p>
              <p className="text-lg text-black dark:text-white mb-8 leading-relaxed">
                CodePulse captures server-side push events from GitHub repositories, processes commit metadata, and constructs chronological timelines for every participating team. The system uses server-generated timestamps to guarantee fairness and resistance to manipulation.
              </p>
              <a href="#how-it-works" className="inline-flex items-center text-black dark:text-white font-semibold text-lg hover:underline">
                Learn more about webhooks →
              </a>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-black dark:border-white">
                <img
                  src="https://images.ctfassets.net/8aevphvgewt8/5kQRGLt3dEgZqraqssC3kL/368efb01e151493475985a0e194abfff/codespaces-river-breakout.webp?w=2496&fm=webp&q=90"
                  alt="Real-time monitoring dashboard"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-black dark:border-white">
                <img
                  src="https://images.ctfassets.net/8aevphvgewt8/aGwuMiJ99BFm0IZOx7aBc/9d524ffddfa0091447b6f00d6d5d6473/features-codespaces-port-forwarding.webp?w=1440&fm=webp&q=90"
                  alt="Compliance and violation detection"
                  className="w-full"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{
                  fontFamily: 'Minecraftia, sans-serif',
                  color: '#FFD700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
                }}
              >
                RULE-BASED COMPLIANCE
              </h2>
              <p className="text-xl text-black dark:text-white mb-6 leading-relaxed">
                Automated compliance engine evaluates development activity against predefined hackathon rules and detects violations.
              </p>
              <p className="text-lg text-black dark:text-white mb-8 leading-relaxed">
                The system automatically detects rule violations including excessive inactivity, irregular patterns, and non-compliance with hackathon guidelines. Organizers receive instant alerts and can review detailed violation reports through the comprehensive admin dashboard.
              </p>
              <a href="#documentation" className="inline-flex items-center text-black dark:text-white font-semibold text-lg hover:underline">
                Explore compliance features →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{
                fontFamily: 'Minecraftia, sans-serif',
                color: '#FFD700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
              }}
            >
              EVERYTHING YOU NEED FOR FAIR HACKATHONS
            </h2>
            <p className="text-xl text-black dark:text-white max-w-3xl mx-auto">
              A comprehensive monitoring system designed to ensure fair hackathon participation with real-time insights and automated compliance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black p-8 rounded-xl border border-black dark:border-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">GitHub Webhooks</h3>
              <p className="text-black dark:text-white leading-relaxed">
                Secure webhook handling captures every push event from participant repositories in real-time, ensuring no activity goes untracked.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-black dark:border-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">Timeline Visualization</h3>
              <p className="text-black dark:text-white leading-relaxed">
                Chronological development timelines for every team show commit activity, push frequency, and development patterns throughout the hackathon.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-black dark:border-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">Violation Detection</h3>
              <p className="text-black dark:text-white leading-relaxed">
                Automated detection of rule violations including excessive inactivity, irregular patterns, and non-compliance with hackathon guidelines.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-black dark:border-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">Organizer Dashboard</h3>
              <p className="text-black dark:text-white leading-relaxed">
                Comprehensive admin interface for monitoring all teams, viewing activity summaries, and generating compliance reports for judges.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-black dark:border-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">Secure Authentication</h3>
              <p className="text-black dark:text-white leading-relaxed">
                OAuth integration with GitHub and Google ensures secure access while maintaining participant privacy and data protection.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-black dark:border-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">Real-time Updates</h3>
              <p className="text-black dark:text-white leading-relaxed">
                Live dashboard updates provide instant visibility into team progress, ensuring organizers stay informed throughout the event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="pt-0 pb-24 bg-white dark:bg-black" id="how-it-works">
        {/* Simply Focus.webp Section */}
        <img src="/Focus.webp" className="w-full object-cover" alt="Focus Mode" />

        {/* Minecraft Game Mode Slider (after How CodePulse Works) */}
        <div className="w-full bg-black">
          <MinecraftModeSlider />
        </div>

        {/* How CodePulse Works Section - White Background with Pixel Pattern */}
        <div className="relative bg-white dark:bg-white py-12 border-b border-gray-200">
          {/* Minecraft Pixelated Pattern - Top Left Corner - Larger Size */}
          <div className="absolute top-0 left-0 flex flex-col">
            {/* Row 1 */}
            <div className="flex">
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-[#111]"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-[#111]"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white"></div>
            </div>
            {/* Row 2 */}
            <div className="flex">
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-[#111]"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-[#111]"></div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 md:pt-28 lg:pt-32">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 mb-16 px-4 md:px-8">
              <div className="text-center lg:text-left flex-1">
                <h2
                  className="text-3xl md:text-5xl font-bold mb-6"
                  style={{
                    fontFamily: 'Minecraftia, sans-serif',
                    color: '#FFD700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
                  }}
                >
                  HOW CODEPULSE WORKS
                </h2>
                <p className="text-xl text-black max-w-2xl leading-relaxed">
                  CodePulse uses GitHub as the single source of truth, capturing real-time push events through webhooks to ensure fair hackathon participation.
                </p>
              </div>
              <img
                src="/code.png"
                alt="CodePulse Logo"
                className="w-full max-w-xs lg:max-w-none lg:w-96 h-auto object-contain drop-shadow-md flex-shrink-0 mt-8 lg:-mt-24"
              />
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 border-2 border-[#FFD700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  1
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{
                    fontFamily: 'Minecraftia, sans-serif',
                    color: '#FFD700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 #000, 3px 3px 0 #222',
                  }}
                >
                  Connect Repository
                </h3>
                <p className="text-lg text-black leading-relaxed">
                  Teams connect their GitHub repositories and CodePulse automatically configures webhooks for monitoring.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 border-2 border-[#FFD700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  2
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{
                    fontFamily: 'Minecraftia, sans-serif',
                    color: '#FFD700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 #000, 3px 3px 0 #222',
                  }}
                >
                  Track Activity
                </h3>
                <p className="text-lg text-black leading-relaxed">
                  Every push event is captured in real-time with server-generated timestamps for tamper-proof tracking.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 border-2 border-[#FFD700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  3
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{
                    fontFamily: 'Minecraftia, sans-serif',
                    color: '#FFD700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 #000, 3px 3px 0 #222',
                  }}
                >
                  Ensure Compliance
                </h3>
                <p className="text-lg text-black leading-relaxed">
                  Automated rules engine detects violations and generates reports for organizers and judges.
                </p>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24 bg-white dark:bg-black border-b border-black dark:border-white" id="open-source">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{
                fontFamily: 'Minecraftia, sans-serif',
                color: '#FFD700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
              }}
            >
              OPEN SOURCE & COMMUNITY DRIVEN
            </h2>
            <p className="text-xl text-black dark:text-white max-w-3xl mx-auto mb-8 leading-relaxed">
              CodePulse is an open-source project licensed under GPL-3.0. Contributions, feature requests, and feedback are welcome from the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a href="https://github.com/Gouravkumarpandey/CodePulse" target="_blank" rel="noopener noreferrer">
                <button className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View on GitHub
                </button>
              </a>
              <a href="https://github.com/Gouravkumarpandey/CodePulse" target="_blank" rel="noopener noreferrer">
                <button className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                  ⭐ Star on GitHub
                </button>
              </a>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">GPL-3.0</div>
                <div className="text-sm text-black dark:text-white">License</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">Node.js</div>
                <div className="text-sm text-black dark:text-white">Backend</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">React</div>
                <div className="text-sm text-black dark:text-white">Frontend</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">MongoDB</div>
                <div className="text-sm text-black dark:text-white">Database</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">Express</div>
                <div className="text-sm text-black dark:text-white">Framework</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">GitHub</div>
                <div className="text-sm text-black dark:text-white">API</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-black text-black dark:text-white relative overflow-hidden border-t border-b border-black dark:border-white" id="documentation">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{
              fontFamily: 'Minecraftia, sans-serif',
              color: '#FFD700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
            }}
          >
            START MONITORING YOUR HACKATHON TODAY
          </h2>
          <p className="text-xl mb-10 text-black dark:text-white leading-relaxed">
            Join hackathon organizers who trust CodePulse to ensure fair and transparent competitions. Get started in minutes with our easy setup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Get Started for Free →
            </button>
            <a href="https://github.com/Gouravkumarpandey/CodePulse" target="_blank" rel="noopener noreferrer">
              <button className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                View Documentation
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer with Image */}
      <footer className="relative bg-[#131313] text-white pt-16 pb-16 font-sans overflow-hidden">


        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-16">

          {/* Left Side: Logos & Copyright */}
          <div className="flex flex-col gap-8 md:w-1/3">
            <div className="flex items-center gap-8">
              <img src="/logo.jpg" alt="CodePulse Studio" className="h-16 w-auto object-contain" />
              <img src="https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/logos/Logo_Xbox_Game_Studio.png" alt="Xbox Game Studios" className="h-16 w-auto object-contain" />
            </div>
            <div className="text-gray-400 text-base space-y-2">
              <p>&copy; {new Date().getFullYear()} CodePulse.</p>
              <div className="flex gap-4 text-[#43b526]">
                <a href="#" className="hover:underline">CodePulse Usage Guidelines</a>
                <span>|</span>
                <a href="#" className="hover:underline">Manage Consent</a>
              </div>
            </div>
          </div>

          {/* Right Side: Links Grid */}
          {/* Right Side: Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8 flex-1">
            <div>
              <h4 className="font-bold mb-4 text-xl text-white">Product</h4>
              <ul className="space-y-2 text-gray-400 text-base">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white hover:underline transition-colors">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white hover:underline transition-colors">How It Works</a></li>
                <li><a href="#documentation" onClick={(e) => { e.preventDefault(); document.getElementById('documentation')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white hover:underline transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-xl text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-base">
                <li><a href="#" className="hover:text-white hover:underline transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-xl text-white">Company</h4>
              <ul className="space-y-2 text-gray-400 text-base">
                <li><a href="#" className="hover:text-white hover:underline transition-colors">About</a></li>
                <li><a href="/privacy" className="hover:text-white hover:underline transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white hover:underline transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="relative z-10 mt-0 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-end items-center gap-6 text-sm text-white">
          <a href="/privacy" className="hover:underline transition-colors">Privacy and Cookies</a>
          <a href="/terms" className="hover:underline transition-colors">Terms of use</a>
          <a href="#" className="hover:underline transition-colors">Trademarks</a>
          <a href="#" className="hover:underline transition-colors">About our ads</a>
          <span>&copy; {new Date().getFullYear()} CodePulse</span>
        </div>
      </footer>
    </div>
  );
};

export default CodePulseHomePage;