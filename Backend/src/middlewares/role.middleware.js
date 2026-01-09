/**
 * Role Middleware
 * Admin and User access control
 */

const response = require('../utils/response.util');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return response.error(res, 'User not authenticated', 401);
  }

  if (req.user.role !== 'ADMIN') {
    return response.error(res, 'Admin access required', 403);
  }

  next();
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return response.error(res, 'User not authenticated', 401);
  }

  if (req.user.role !== 'USER' && req.user.role !== 'ADMIN') {
    return response.error(res, 'User access required', 403);
  }

  next();
};

module.exports = { requireAdmin, requireUser };
