import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'INFORMATION WE COLLECT',
            icon: '🗂️',
            content: [
                {
                    subtitle: 'Account Information',
                    text: 'When you register for CodePulse, we collect your name, email address, and profile information from your GitHub or Google OAuth provider. This includes your public GitHub username and profile picture.',
                },
                {
                    subtitle: 'GitHub Repository Data',
                    text: 'With your explicit authorization, CodePulse accesses repository metadata, commit history, push events via webhooks, and activity timelines. We only access repositories that you specifically connect to our platform.',
                },
                {
                    subtitle: 'Usage & Activity Data',
                    text: 'We collect information about how you interact with CodePulse, including pages visited, features used, actions taken, timestamps, and device/browser information for security and performance optimization.',
                },
            ],
        },
        {
            title: 'HOW WE USE YOUR DATA',
            icon: '⚙️',
            content: [
                {
                    subtitle: 'Service Delivery',
                    text: 'We use your data to provide real-time commit tracking, activity timelines, hackathon compliance monitoring, violation detection, and admin dashboard reporting.',
                },
                {
                    subtitle: 'Security & Integrity',
                    text: 'Your data is used to authenticate requests, detect rule violations, prevent abuse, and ensure the tamper-proof nature of hackathon monitoring using server-generated timestamps.',
                },
                {
                    subtitle: 'Improvements',
                    text: 'Aggregated, anonymized usage data helps us improve platform performance, fix bugs, and design new features. We never sell your personal data to third parties.',
                },
            ],
        },
        {
            title: 'DATA SHARING & THIRD PARTIES',
            icon: '🤝',
            content: [
                {
                    subtitle: 'GitHub API',
                    text: 'CodePulse uses the GitHub API as the single source of truth for repository events. Your GitHub credentials are managed via GitHub\'s OAuth system and never stored directly by us.',
                },
                {
                    subtitle: 'Firebase & Google Cloud',
                    text: 'We use Firebase (by Google) for authentication and database services. Your data is stored in Google Cloud infrastructure with industry-standard encryption at rest and in transit.',
                },
                {
                    subtitle: 'No Data Sales',
                    text: 'We do not sell, rent, or trade your personal information to any third party for marketing or advertising purposes. Period.',
                },
            ],
        },
        {
            title: 'DATA RETENTION',
            icon: '🕐',
            content: [
                {
                    subtitle: 'Active Accounts',
                    text: 'We retain your data for as long as your account is active or as needed to provide services. Commit and activity data is retained for the duration of the associated hackathon plus 90 days.',
                },
                {
                    subtitle: 'Account Deletion',
                    text: 'If you delete your account, we will remove your personal data within 30 days. Some aggregated analytics data may be retained in anonymized form.',
                },
            ],
        },
        {
            title: 'YOUR RIGHTS',
            icon: '⚖️',
            content: [
                {
                    subtitle: 'Access & Portability',
                    text: 'You have the right to request a copy of all personal data we hold about you in a portable, machine-readable format.',
                },
                {
                    subtitle: 'Correction & Deletion',
                    text: 'You can update your account information at any time via Settings. You may also request deletion of your account and associated data.',
                },
                {
                    subtitle: 'Opt-Out',
                    text: 'You may revoke CodePulse\'s access to your GitHub repositories at any time through your GitHub account settings or the CodePulse settings page.',
                },
            ],
        },
        {
            title: 'SECURITY',
            icon: '🔐',
            content: [
                {
                    subtitle: 'Technical Safeguards',
                    text: 'All data is encrypted in transit using TLS 1.3. Database access is restricted with role-based permissions. We use Firebase Security Rules to protect your Firestore data.',
                },
                {
                    subtitle: 'Webhook Security',
                    text: 'All GitHub webhooks are verified using HMAC-SHA256 signature validation, ensuring only authentic GitHub events are processed by our system.',
                },
            ],
        },
        {
            title: 'CONTACT US',
            icon: '📬',
            content: [
                {
                    subtitle: 'Privacy Inquiries',
                    text: 'If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@innovexlabs.me or through our GitHub repository at github.com/Gouravkumarpandey/CodePulse.',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">


            {/* Hero Header */}
            <div className="relative bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,215,0,0.1) 31px, rgba(255,215,0,0.1) 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(255,215,0,0.1) 31px, rgba(255,215,0,0.1) 32px)',
                    }} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h1
                        className="text-3xl md:text-5xl font-bold mb-4"
                        style={{
                            fontFamily: 'Minecraftia, sans-serif',
                            color: '#FFD700',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
                        }}
                    >
                        Privacy Policy
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
                        At CodePulse, we believe in radical transparency about how we collect, use, and protect your data.
                    </p>

                </div>
            </div>

            {/* Quick Summary Banner */}
            <div className="bg-[#FFD700] py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black text-center">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🚫</span>
                            <span className="font-bold" style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}>No Data Sales</span>
                            <span className="text-sm opacity-80">We never sell your data</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🔐</span>
                            <span className="font-bold" style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}>Encrypted</span>
                            <span className="text-sm opacity-80">TLS 1.3 + Firebase Security</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">✅</span>
                            <span className="font-bold" style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}>Your Control</span>
                            <span className="text-sm opacity-80">Delete your data anytime</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Introduction */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-12">
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        This Privacy Policy describes how <strong className="text-black dark:text-white">CodePulse</strong> (operated by{' '}
                        <strong className="text-black dark:text-white">Innovexlabs</strong>) collects, uses, and
                        shares information when you use our hackathon monitoring platform. By using CodePulse, you agree to the
                        collection and use of information in accordance with this policy. This policy applies to all services
                        accessible at{' '}
                        <span className="text-[#1a8cff] font-medium">codepulse.innovexlabs.me</span> and related sub-domains.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-[#FFD700] dark:hover:border-[#FFD700] transition-colors duration-200"
                        >
                            {/* Section Header */}
                            <div className="bg-black px-8 py-5 flex items-center gap-4">
                                <span className="text-3xl">{section.icon}</span>
                                <h2
                                    className="text-lg font-bold"
                                    style={{
                                        fontFamily: 'Minecraftia, sans-serif',
                                        color: '#FFD700',
                                        letterSpacing: '0.06em',
                                        textShadow: '1px 1px 0 #000',
                                    }}
                                >
                                    {section.title}
                                </h2>
                            </div>

                            {/* Section Content */}
                            <div className="bg-white dark:bg-gray-900 px-8 py-6 space-y-6">
                                {section.content.map((item, itemIdx) => (
                                    <div key={itemIdx}>
                                        <h3 className="font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#FFD700] rounded-full inline-block" />
                                            {item.subtitle}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Open Source Notice */}
                <div className="mt-12 bg-black rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-4">🌍</div>
                    <h3
                        className="text-xl font-bold mb-3"
                        style={{
                            fontFamily: 'Minecraftia, sans-serif',
                            color: '#FFD700',
                            textShadow: '1px 1px 0 #000',
                        }}
                    >
                        OPEN SOURCE COMMITMENT
                    </h3>
                    <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-6">
                        CodePulse is licensed under GPL-3.0. Our codebase is publicly auditable on GitHub. We believe
                        in transparency not just in words, but in verifiable code.
                    </p>
                    <a
                        href="https://github.com/Gouravkumarpandey/CodePulse"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-[#FFD700] transition-colors"
                        style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.8rem' }}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        View Source on GitHub
                    </a>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
