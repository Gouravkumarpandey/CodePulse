/**
 * GitHub OAuth & webhook configuration
 * Handles GitHub app credentials and webhook settings
 */

const GITHUB_CONFIG = {
  clientID: (process.env.GITHUB_CLIENT_ID || '').trim(),
  clientSecret: (process.env.GITHUB_CLIENT_SECRET || '').trim(),
  redirectURL: process.env.GITHUB_REDIRECT_URL || 'http://localhost:5173/github/callback',
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  appName: process.env.GITHUB_APP_NAME || 'CodePulse',
};

module.exports = GITHUB_CONFIG;
