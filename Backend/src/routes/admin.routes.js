/**
 * Admin Routes
 * /api/admin/*
 */

const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authMiddleware.verifyToken);
router.use(roleMiddleware.requireAdmin);

// Settings
router.get('/settings', adminController.getAdminSettings);
router.put('/settings', adminController.updateAdminSettings);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetail);

// Activity Monitoring
router.get('/activity-monitoring', adminController.getUserActivityMonitoring);
router.get('/violations', adminController.getActivityViolations);

// Admin Actions
router.post('/actions/warning', adminController.issueWarning);
router.post('/actions/observation', adminController.setObservation);
router.post('/actions/disqualify', adminController.disqualifyUser);
router.post('/actions/reactivate', adminController.reactivateUser);

module.exports = router;
