/**
 * Webhook Middleware
 * GitHub webhook signature verification
 */

const crypto = require('crypto');
const GITHUB_CONFIG = require('../config/github');
const response = require('../utils/response.util');

const verifyGitHubSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
      return response.error(res, 'Missing webhook signature', 400);
    }

    const payload = JSON.stringify(req.body);
    const hash = crypto
      .createHmac('sha256', GITHUB_CONFIG.webhookSecret)
      .update(payload)
      .digest('hex');

    const expectedSignature = `sha256=${hash}`;

    if (!crypto.timingSafeEqual(signature, expectedSignature)) {
      return response.error(res, 'Invalid webhook signature', 401);
    }

    next();
  } catch (error) {
    response.error(res, 'Webhook verification failed', 500);
  }
};

module.exports = { verifyGitHubSignature };
