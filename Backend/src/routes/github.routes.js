const express = require('express');
const githubController = require('../controllers/github.controller');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Public callback (no auth required) - redirected to auth controller for central handling
router.get('/callback', authController.githubCallback);

// Repositories - uses GitHub token from Authorization header (not JWT)
router.get('/repositories', githubController.fetchRepositories);

// Protected routes (require JWT auth)
router.post('/link-account', authMiddleware.verifyToken, githubController.linkGitHubAccount);
router.post('/connect-repo', authMiddleware.verifyToken, githubController.connectRepository);

module.exports = router;
