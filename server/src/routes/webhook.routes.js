// webhook.routes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const verifyWebhook = require('../middlewares/verifyWebhook');

router.post('/github', verifyWebhook, webhookController.handleWebhook);

module.exports = router;
