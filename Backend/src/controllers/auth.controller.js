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
        console.log(`Linking GitHub account ${githubId} to existing user ${existingUser.email}`);
        await DatabaseService.updateUser(existingUser.id, {
          githubId: githubId,
          githubAccessToken: accessToken,
          // meaningful updates
          lastLogin: new Date().toISOString(),
          isActive: true
        });
        // Update local object
        user = { ...existingUser, githubId, githubAccessToken: accessToken };
      }
    }

    // 3. If still not found, Create New User
    if (!user) {
      const crypto = require('crypto');
      const userId = crypto.randomUUID();
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

      await DatabaseService.saveUser(userId, userData);
      user = { id: userId, ...userData }; // Properly assign user
    } else {
      // Exists (either found by ID or Linked), just update token/login time
      // If user was just linked above, user object is set. If found by ID, it's set.
      // We should update the token if it changed.
      if (user.githubAccessToken !== accessToken) {
        await DatabaseService.updateUser(user.id, {
          githubAccessToken: accessToken,
          lastLogin: new Date().toISOString()
        });
        user.githubAccessToken = accessToken;
      }
    }

    const token = generateJWT(user.id);
    const userResponseData = { ...user };
    if (userResponseData.password) delete userResponseData.password;

    // Return JSON response as expected by frontend fetch
    // Note: The structure must match what frontend expects
    return response.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.avatarId,
      },
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
    const { credential } = req.body;

    if (!credential) {
      return response.error(res, 'Google credential token is required', 400);
    }

    // Verify the Google ID Token
    // We use the tokeninfo endpoint as we don't have google-auth-library installed on backend
    // Valid for low-volume verification
    const verifyResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);

    if (verifyResponse.status !== 200 || !verifyResponse.data) {
      throw new Error('Invalid Google Token');
    }

    const payload = verifyResponse.data;
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // 1. Try to find by Email (Primary)
    let user = await DatabaseService.getUserByEmail(email);

    // 2. If existing user, verify/link Google ID
    if (user) {
      // If Google ID isn't linked, link it now? Or just log them in?
      // Let's link it to be consistent with GitHub flow
      if (!user.googleId) {
        await DatabaseService.updateUser(user.id, {
          googleId: googleId,
          avatar: user.avatar || picture, // Keep existing if present
          lastLogin: new Date().toISOString(),
          isActive: true
        });
        user.googleId = googleId;
      } else {
        // Just update login time
        await DatabaseService.updateUser(user.id, {
          lastLogin: new Date().toISOString()
        });
      }
    }

    // 3. Create New User if not exists
    if (!user) {
      const crypto = require('crypto');
      const userId = crypto.randomUUID();

      const userData = {
        email,
        username: name || email.split('@')[0], // Fallback username
        googleId: googleId,
        avatar: picture,
        role: 'USER',
        coins: 0,
        avatarId: 1, // Default Minecraft avatar
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await DatabaseService.saveUser(userId, userData);
      user = { id: userId, ...userData };
    }

    const token = generateJWT(user.id);
    const userResponseData = { ...user };
    delete userResponseData.password;

    // Include githubAccessToken in response if user has GitHub connected
    const responseData = {
      status: 'SUCCESS',
      user: userResponseData,
      token
    };
    if (user.githubAccessToken) {
      responseData.githubAccessToken = user.githubAccessToken;
    }

    // Return success
    response.success(res, responseData, 'Google authentication successful');

  } catch (error) {
    console.error('Google OAuth callback error:', error.message);
    response.error(res, 'Google authentication failed: ' + error.message, 500);
  }
};

const logout = (req, res) => {
  response.success(res, {}, 'Logout successful');
};

module.exports = { signup, login, githubAuth, githubCallback, logout, googleCallback };
