import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'ACCEPTANCE OF TERMS',
            icon: '📜',
            content: [
                {
                    text: 'By accessing or using CodePulse (the "Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Service.',
                },
                {
                    text: 'These Terms apply to all visitors, users, participants, and hackathon organizers who access or use the Service. By creating an account, you confirm that you are at least 13 years of age (or the age of digital consent in your jurisdiction).',
                },
            ],
        },
        {
            title: 'SERVICE DESCRIPTION',
            icon: '🖥️',
            content: [
                {
                    text: 'CodePulse is a real-time hackathon monitoring platform that uses GitHub webhooks to track commit activity, detect rule violations, and provide transparent compliance reporting. The Service includes a participant dashboard, organizer admin panel, and automated compliance engine.',
                },
                {
                    text: 'CodePulse is an open-source project licensed under GPL-3.0. While the software itself is freely available, use of the hosted Service is governed by these Terms.',
                },
            ],
        },
        {
            title: 'USER ACCOUNTS & RESPONSIBILITIES',
            icon: '👤',
            subsections: [
                {
                    subtitle: 'Account Security',
                    text: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at security@innovexlabs.me of any unauthorized use of your account. We are not liable for any losses arising from unauthorized account access due to your failure to keep credentials secure.',
                },
                {
                    subtitle: 'Accurate Information',
                    text: 'You agree to provide accurate, current, and complete information when creating your account and to keep this information up-to-date. Impersonation of other users, teams, or organizations is strictly prohibited.',
                },
                {
                    subtitle: 'GitHub Authorization',
                    text: 'By connecting your GitHub account, you grant CodePulse permission to read repository metadata, commit data, and receive webhook events for repositories you explicitly connect. You may revoke this access at any time through GitHub account settings.',
                },
            ],
        },
        {
            title: 'ACCEPTABLE USE POLICY',
            icon: '✅',
            subsections: [
                {
                    subtitle: 'Prohibited Activities',
                    text: 'You may not use CodePulse to: circumvent hackathon monitoring rules; tamper with webhook delivery or forge commit timestamps; access other users\' data without authorization; reverse-engineer the platform with malicious intent; or use the Service for any illegal purpose.',
                },
                {
                    subtitle: 'Hackathon Integrity',
                    text: 'Participants agree not to manipulate commit histories, force-push to alter timestamps, or engage in any activity designed to mislead the monitoring system. Violations may result in immediate disqualification and account suspension.',
                },
                {
                    subtitle: 'Fair Usage',
                    text: 'You agree not to use automated scripts, bots, or tools to generate artificial activity, stress-test the platform, or consume excessive API resources that could degrade service for other users.',
                },
            ],
        },
        {
            title: 'INTELLECTUAL PROPERTY',
            icon: '💡',
            content: [
                {
                    text: 'The CodePulse software is licensed under the GNU General Public License v3.0 (GPL-3.0). You may use, copy, modify, and distribute the software in accordance with the GPL-3.0 license terms.',
                },
                {
                    text: 'The CodePulse name, logo, branding, and visual design are the property of Innovexlabs and are not covered by the GPL-3.0 license. You may not use our trademarks without prior written permission.',
                },
                {
                    text: 'You retain all intellectual property rights to your repository code and commit data. By using CodePulse, you grant us a limited license to process this data solely for the purpose of providing the monitoring Service.',
                },
            ],
        },
        {
            title: 'DISCLAIMER OF WARRANTIES',
            icon: '⚠️',
            content: [
                {
                    text: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. CODEPULSE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF MALICIOUS CODE.',
                },
                {
                    text: 'While we strive for accuracy in monitoring, organizers should independently verify critical compliance decisions. CodePulse monitoring data is a tool to assist, not replace, human judgment in hackathon management.',
                },
            ],
        },
        {
            title: 'LIMITATION OF LIABILITY',
            icon: '⚖️',
            content: [
                {
                    text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, INNOVEXLABS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.',
                },
                {
                    text: 'Our total liability for any claims relating to the Service shall not exceed the greater of (a) the amount you paid for the Service in the 12 months prior to the claim, or (b) $100 USD. The Service is currently provided free of charge.',
                },
            ],
        },
        {
            title: 'TERMINATION',
            icon: '🚫',
            content: [
                {
                    text: 'We reserve the right to suspend or terminate your account at any time for violation of these Terms, including but not limited to: cheating in hackathons, abuse of the platform, or illegal activity. You will be notified via email prior to termination unless immediate action is required for security reasons.',
                },
                {
                    text: 'You may delete your account at any time through the Settings page. Upon termination, your personal data will be deleted within 30 days in accordance with our Privacy Policy.',
                },
            ],
        },
        {
            title: 'CHANGES TO TERMS',
            icon: '🔄',
            content: [
                {
                    text: 'We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or a prominent notice on our website at least 14 days before the changes take effect. Continued use of the Service after changes constitutes acceptance of the new Terms.',
                },
            ],
        },
        {
            title: 'GOVERNING LAW & CONTACT',
            icon: '🏛️',
            content: [
                {
                    text: 'These Terms shall be governed by the laws of India, without regard to conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of courts in India.',
                },
                {
                    text: 'For questions about these Terms, contact us at legal@innovexlabs.me or through our GitHub repository at github.com/Gouravkumarpandey/CodePulse. We aim to respond to all inquiries within 5 business days.',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">


            {/* Hero Header */}
            <div className="relative bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,215,0,0.1) 31px, rgba(255,215,0,0.1) 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(255,215,0,0.1) 31px, rgba(255,215,0,0.1) 32px)',
                        }}
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="text-6xl mb-6">📋</div>
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
                        Terms of Service
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
                        Please read these Terms carefully before using CodePulse. They form a legal agreement between you and Innovexlabs.
                    </p>

                </div>
            </div>

            {/* Quick Summary Banner */}
            <div className="bg-[#FFD700] py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black text-center">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🎮</span>
                            <span className="font-bold" style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}>Fair Play Only</span>
                            <span className="text-sm opacity-80">No cheating or manipulation</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">📖</span>
                            <span className="font-bold" style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}>GPL-3.0</span>
                            <span className="text-sm opacity-80">Open source software</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">🗑️</span>
                            <span className="font-bold" style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}>Exit Anytime</span>
                            <span className="text-sm opacity-80">Delete your account freely</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Introduction */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-12">
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        Welcome to <strong className="text-black dark:text-white">CodePulse</strong>! These Terms of Service ("Terms") govern your use of the
                        CodePulse platform and related services operated by{' '}
                        <strong className="text-black dark:text-white">Innovexlabs</strong>. By accessing the Service at{' '}
                        <span className="text-[#1a8cff] font-medium">codepulse.innovexlabs.me</span>, you agree to these Terms.
                    </p>
                </div>

                {/* Table of Contents */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-12 bg-gray-50 dark:bg-gray-900">
                    <h2
                        className="text-base font-bold mb-4 text-black dark:text-white"
                        style={{ fontFamily: 'Minecraftia, sans-serif', letterSpacing: '0.05em' }}
                    >
                        TABLE OF CONTENTS
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sections.map((section, idx) => (
                            <a
                                key={idx}
                                href={`#section-${idx}`}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm transition-colors py-1"
                            >
                                <span>{section.icon}</span>
                                <span className="hover:underline">{section.title}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            id={`section-${idx}`}
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
                                    {idx + 1}. {section.title}
                                </h2>
                            </div>

                            {/* Section Content */}
                            <div className="bg-white dark:bg-gray-900 px-8 py-6 space-y-5">
                                {section.content &&
                                    section.content.map((item, itemIdx) => (
                                        <p
                                            key={itemIdx}
                                            className="text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-[#FFD700] pl-4"
                                        >
                                            {item.text}
                                        </p>
                                    ))}
                                {section.subsections &&
                                    section.subsections.map((item, itemIdx) => (
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

                {/* Closing Note */}
                <div className="mt-12 bg-black rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-4">⚔️</div>
                    <h3
                        className="text-xl font-bold mb-3"
                        style={{
                            fontFamily: 'Minecraftia, sans-serif',
                            color: '#FFD700',
                            textShadow: '1px 1px 0 #000',
                        }}
                    >
                        PLAY FAIR. BUILD GREAT.
                    </h3>
                    <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-6">
                        CodePulse exists to make hackathons more transparent and fair. These Terms exist to protect both
                        participants and organizers. If you have any questions, we're here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:legal@innovexlabs.me"
                            className="inline-flex items-center gap-2 bg-[#FFD700] text-black font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors"
                            style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}
                        >
                            📬 Contact Legal Team
                        </a>
                        <a
                            href="https://github.com/Gouravkumarpandey/CodePulse"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                            style={{ fontFamily: 'Minecraftia, sans-serif', fontSize: '0.75rem' }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            View on GitHub
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TermsOfServicePage;
