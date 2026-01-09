/**
 * GitHub Routes
 * /api/github/*
 */

const express = require('express');
const githubController = require('../controllers/github.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/callback', githubController.githubCallback);
router.get('/repositories', authMiddleware.verifyToken, githubController.fetchRepositories);
router.post('/connect-repo', authMiddleware.verifyToken, githubController.connectRepository);

module.exports = router;
