/**
 * Auth Routes
 * /api/auth/*
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Email/Password authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// GitHub OAuth
router.post('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);

// Google OAuth
router.post('/google/callback', authController.googleCallback);

// Clerk Auth
router.post('/clerk', authController.clerkAuth);

// Logout
router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;
