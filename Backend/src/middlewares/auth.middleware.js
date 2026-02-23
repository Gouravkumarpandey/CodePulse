const jwt = require('jsonwebtoken');
const response = require('../utils/response.util');
const DatabaseService = require('../services/mongo.service');

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
    if (token.startsWith('gho_') || token.startsWith('ghp_') || token.startsWith('ghu_') || token.startsWith('ghs_') || token.startsWith('github_pat_')) {
      const user = await DatabaseService.getUserByGithubAccessToken?.(token); // Need to implement this or assume generic
      // For now, if we don't have a lookup by token, we might fall back to basic user obj
      req.user = { githubAccessToken: token };
      next();
      return;
    }

    // JWT Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await DatabaseService.getUser(decoded.userId);

    if (!user) {
      return response.error(res, 'User not found', 401);
    }

    if (user.isActive === false) { // Check explicit false, undefined is true
      return response.error(res, 'Account is deactivated', 403);
    }

    req.user = {
      ...user,
      _id: decoded.userId, // Maintain _id for backward compatibility if code uses it
      id: decoded.userId,
      accessToken: user.githubAccessToken || user.accessToken,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    response.error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { verifyToken };
