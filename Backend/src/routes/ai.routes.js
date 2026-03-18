const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Chat endpoint with verifyToken
router.post('/chat', authMiddleware.verifyToken, aiController.chatWithAI);

module.exports = router;
