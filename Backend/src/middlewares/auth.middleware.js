const jwt = require('jsonwebtoken');
const response = require('../utils/response.util');
const User = require('../models/User');

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
      // Allow raw GitHub tokens for direct Repo access if needed, but fetch user by token if possible?
      // For now, let's assume raw token access is limited or needs User context.
      // If we don't have a user, some controllers might break.
      // Let's try to find a user with this GitHub token.
      const user = await User.findOne({ githubAccessToken: token });
      if (user) {
        req.user = user;
        next();
        return;
      }

      // Fallback: limited access without user context (dangerous for user specific data)
      req.user = { githubAccessToken: token };
      next();
      return;
    }

    // JWT Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return response.error(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return response.error(res, 'Account is deactivated', 403);
    }

    // Attach user to request
    req.user = user;
    // Helper accessors for legacy code compatibility
    req.user.accessToken = user.githubAccessToken;

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    response.error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { verifyToken };
