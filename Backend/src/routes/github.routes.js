const express = require('express');
const githubController = require('../controllers/github.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Public callback (no auth required)
router.get('/callback', githubController.githubCallback);

// Protected routes (require auth)
router.post('/link-account', authMiddleware.verifyToken, githubController.linkGitHubAccount);
router.get('/repositories', authMiddleware.verifyToken, githubController.fetchRepositories);
router.post('/connect-repo', authMiddleware.verifyToken, githubController.connectRepository);

module.exports = router;
