/**
 * Auth Middleware
 * JWT token verification
 */

const jwt = require('jsonwebtoken');
const response = require('../utils/response.util');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return response.error(res, 'No authorization token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    response.error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { verifyToken };
