/**
 * User Routes
 * /api/user/*
 */


const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const manualRepoController = require('../controllers/manualRepo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
// All user routes require authentication
router.use(authMiddleware.verifyToken);

// Manual repository creation
router.post('/manual-repo', manualRepoController.addManualRepository);

// User profile
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.post('/otp', userController.sendOtp);
router.post('/deactivate', userController.deactivateAccount);
router.delete('/', userController.deleteUserAccount);


// Repository management
router.get('/repositories', userController.getUserRepositories);
router.get('/active-repository', userController.getActiveRepository);
router.post('/active-repository', userController.setActiveRepository);
router.delete('/repositories/:repoId', userController.deleteRepository);

// Activity and monitoring
router.get('/activity/:repoId', userController.getRepositoryActivity);
router.get('/warnings', userController.getWarningsAndViolations);
router.get('/dashboard', userController.getDashboardSummary);

// Rules (read-only)
router.get('/rules', userController.getAdminRules);

// Hackathon Status
router.get('/hackathon/status', userController.getHackathonStatus);

module.exports = router;
