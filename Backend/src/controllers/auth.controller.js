const DatabaseService = require('../services/mongo.service');
const { generateJWT } = require('../utils/jwt.util');
const response = require('../utils/response.util');
const logger = require('../utils/logger.util');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const GITHUB_CONFIG = require('../config/github');

// Email/Password Signup
const signup = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;
    logger.info(`Starting signup for user: ${email}`);

    if (!email || !password || !username) {
      return response.error(res, 'Email, password, and username are required', 400);
    }

    // Check if user exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return response.error(res, 'User with this email already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const userData = {
      email,
      password: hashedPassword,
      username,
      role: role || 'USER',
      coins: 0,
      avatarId: 1,
      isActive: true,
    };

    const user = await DatabaseService.saveUser(null, userData);
    const userId = user._id;

    const token = generateJWT(userId);
    const userResponse = user.toObject();
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'User created successfully', 201);
  } catch (error) {
    logger.error('Signup error:', {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    response.error(res, `Signup failed: ${error.message}`, 500);
  }
};

// Email/Password Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(res, 'Email and password are required', 400);
    }

    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return response.error(res, 'Invalid email or password', 401);
    }

    // Check password - handle both hashed (new) and plain text (legacy)
    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      // Hashed password
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain text password
      isMatch = (user.password === password);

      // Upgrade plain text password to hashed one if it matches
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await DatabaseService.updateUser(user.id, { password: hashedPassword });
        console.log(`Upgraded password for user: ${email}`);
      }
    }

    if (!isMatch) {
      return response.error(res, 'Invalid email or password', 401);
    }

    if (user.isActive === false) {
      return response.error(res, 'Account is deactivated. Please contact support.', 403);
    }

    await DatabaseService.updateUser(user.id, { lastLogin: new Date().toISOString() });

    const token = generateJWT(user.id);
    const userResponse = { ...user };
    delete userResponse.password;

    // Include githubAccessToken in response if user has GitHub connected
    const responseData = { user: userResponse, token };
    if (user.githubAccessToken) {
      responseData.githubAccessToken = user.githubAccessToken;
    }

    response.success(res, responseData, 'Login successful');
  } catch (error) {
    logger.error('Login error:', {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    response.error(res, `Login failed: ${error.message}`, 500);
  }
};

// GitHub OAuth Callback
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return response.error(res, 'Authorization code is required', 400);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CONFIG.clientID,
        client_secret: GITHUB_CONFIG.clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return response.error(res, 'Failed to obtain access token', 400);
    }

    // Fetch user data from GitHub
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userRes.data;
    const githubId = githubUser.id.toString();

    // 1. Try to find by GitHub ID
    let user = await DatabaseService.getUserByGithubId(githubId);

    // 2. If not found, try to find by Email (Account Linking)
    if (!user && githubUser.email) {
      const existingUser = await DatabaseService.getUserByEmail(githubUser.email);
      if (existingUser) {
        logger.info(`Linking GitHub account ${githubId} to existing user ${existingUser.email}`);
        user = await DatabaseService.updateUser(existingUser._id || existingUser.id, {
          githubId: githubId,
          githubAccessToken: accessToken,
          lastLogin: new Date().toISOString(),
          isActive: true
        });
      }
    }

    // 3. If still not found, Create New User
    if (!user) {
      const email = githubUser.email || `${githubId}@github.temp`;
      const userData = {
        email,
        username: githubUser.login,
        githubId: githubId,
        githubAccessToken: accessToken,
        avatar: githubUser.avatar_url,
        role: 'USER',
        coins: 0,
        avatarId: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      user = await DatabaseService.saveUser(null, userData);
      logger.info(`Created new user via GitHub: ${user.email}`);
    } else {
      // Exists, update token if changed
      if (user.githubAccessToken !== accessToken) {
        user = await DatabaseService.updateUser(user._id || user.id, {
          githubAccessToken: accessToken,
          lastLogin: new Date().toISOString()
        });
      }
    }

    const userIdForJWT = user._id || user.id;
    const token = generateJWT(userIdForJWT);

    const userResponse = user.toObject ? user.toObject() : { ...user };
    if (userResponse.password) delete userResponse.password;

    // Standardize user object for frontend
    const standardizedUser = {
      id: userResponse._id || userResponse.id,
      username: userResponse.username,
      email: userResponse.email,
      role: userResponse.role,
      avatar: userResponse.avatar || userResponse.avatarId,
      githubUsername: userResponse.username, // Using GitHub login as username
    };

    return response.success(res, {
      token,
      user: standardizedUser,
      githubAccessToken: accessToken
    }, 'GitHub authentication successful');

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    response.error(res, error.message || 'GitHub authentication failed', 500);
  }
};

// Manual GitHub Auth (Post body)
const githubAuth = async (req, res) => {
  // This seems redundant given callback flow, but implementing for completeness if frontend calls it directly
  try {
    const { githubId, username, email, avatar, accessToken } = req.body;
    // Similar logic to callback...
    // ...
    return response.success(res, {}, 'Not fully implemented, use callback flow');
  } catch (e) {
    return response.error(res, e.message, 500);
  }
};

const googleCallback = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return response.error(res, 'Google credential token or access token is required', 400);
    }

    let payload;
    if (accessToken) {
      // Verify via userinfo endpoint using access token
      const verifyResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      payload = verifyResponse.data;
    } else {
      // Verify via tokeninfo endpoint using ID token (credential)
      const verifyResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      payload = verifyResponse.data;
    }

    if (!payload) {
      throw new Error('Invalid Google Token');
    }

    const googleId = payload.sub || payload.id;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    if (!email) {
      throw new Error('Google account must have an email address');
    }

    // 1. Try to find by Email (Primary)
    let user = await DatabaseService.getUserByEmail(email);

    // 2. If existing user, verify/link Google ID
    if (user) {
      const updateData = {
        lastLogin: new Date().toISOString(),
        isActive: true
      };

      if (!user.googleId) {
        updateData.googleId = googleId;
        if (!user.avatar && picture) updateData.avatar = picture;
      }

      user = await DatabaseService.updateUser(user._id || user.id, updateData);
    }

    // 3. Create New User if not exists
    if (!user) {
      const userData = {
        email,
        username: name || email.split('@')[0],
        googleId: googleId,
        avatar: picture,
        role: 'USER',
        coins: 0,
        avatarId: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      user = await DatabaseService.saveUser(null, userData);
      logger.info(`Created new user via Google: ${user.email}`);
    }

    // Generate JWT
    const token = generateJWT(user._id || user.id);

    // Standardize user object for frontend
    const userObj = user.toObject ? user.toObject() : user;
    const standardizedUser = {
      id: userObj._id || userObj.id,
      username: userObj.username,
      email: userObj.email,
      role: userObj.role,
      avatar: userObj.avatar || userObj.avatarId,
    };

    const responseData = {
      user: standardizedUser,
      token
    };

    if (user.githubAccessToken) {
      responseData.githubAccessToken = user.githubAccessToken;
    }

    return response.success(res, responseData, 'Google authentication successful');

  } catch (error) {
    logger.error('Google OAuth callback error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    response.error(res, 'Google authentication failed: ' + (error.response?.data?.message || error.message), 500);
  }
};

const logout = (req, res) => {
  response.success(res, {}, 'Logout successful');
};

module.exports = { signup, login, githubAuth, githubCallback, logout, googleCallback };
