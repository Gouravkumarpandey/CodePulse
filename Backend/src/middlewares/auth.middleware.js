/**
 * Auth Middleware
 * JWT token verification
 */

const jwt = require('jsonwebtoken');
const response = require('../utils/response.util');
const FirestoreService = require('../services/firestore.service');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return response.error(res, 'No authorization token provided', 401);
    }

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
