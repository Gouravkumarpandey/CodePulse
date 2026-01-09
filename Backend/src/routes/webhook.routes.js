/**
 * Webhook Routes
 * /api/webhook/*
 */

const express = require('express');
const webhookController = require('../controllers/webhook.controller');
const webhookMiddleware = require('../middlewares/webhook.middleware');

const router = express.Router();

router.post('/github/push', webhookMiddleware.verifyGitHubSignature, webhookController.handlePushEvent);

module.exports = router;
