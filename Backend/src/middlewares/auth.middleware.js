/**
 * Auth Middleware
 * JWT token verification
 */

const jwt = require('jsonwebtoken');
const response = require('../utils/response.util');
const FirestoreService = require('../services/firestore.service');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return response.error(res, 'No authorization token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return response.error(res, 'No authorization token provided', 401);
    }

    // Check if this is a GitHub token (not a JWT)
    // GitHub tokens start with 'gho_', 'ghp_', etc.
    if (token.startsWith('gho_') || token.startsWith('ghp_') || token.startsWith('ghu_') || token.startsWith('ghs_')) {
      // This is a GitHub token, use it directly
      req.user = {
        accessToken: token,
        githubAccessToken: token,
      };
      console.log('GitHub token detected and used directly');
      next();
      return;
    }

    // Otherwise, treat as JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT decoded:', decoded);
    
    const user = await FirestoreService.getUser(decoded.userId);
    console.log('User fetched from Firestore:', user ? `${user.email}` : 'NOT FOUND');

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    req.user = {
      ...user,
      _id: decoded.userId,
      // Support both accessToken and githubAccessToken field names
      accessToken: user.githubAccessToken || user.accessToken,
    };
    console.log('User attached to request with accessToken:', !!req.user.accessToken);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    response.error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { verifyToken };
