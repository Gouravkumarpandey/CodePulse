/**
 * User Routes
 * /api/user/*
 */

const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware.verifyToken);

// User profile
router.get('/profile', userController.getUserProfile);

// Repository management
router.get('/repositories', userController.getUserRepositories);
router.get('/active-repository', userController.getActiveRepository);
router.post('/active-repository', userController.setActiveRepository);

// Activity and monitoring
router.get('/activity/:repoId', userController.getRepositoryActivity);
router.get('/warnings', userController.getWarningsAndViolations);
router.get('/dashboard', userController.getDashboardSummary);

// Rules (read-only)
router.get('/rules', userController.getAdminRules);

module.exports = router;
