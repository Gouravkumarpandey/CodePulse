const User = require('../models/User');
const { generateJWT } = require('../utils/jwt.util');
const response = require('../utils/response.util');
const axios = require('axios');
const GITHUB_CONFIG = require('../config/github');

// Email/Password Signup
const signup = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username) {
      return response.error(res, 'Email, password, and username are required', 400);
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return response.error(res, 'User with this email or username already exists', 400);
    }

    const newUser = new User({
      email,
      password, // In a real app, hash this!
      username,
      role: role || 'USER',
      coins: 0,
      avatarId: 1,
    });

    await newUser.save();

    const token = generateJWT(newUser._id);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'User created successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    response.error(res, error.message, 500);
  }
};

// Email/Password Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(res, 'Email and password are required', 400);
    }

    // Find user (explicitly including password field if it was selected out by default)
    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, 'Invalid email or password', 401);
    }

    if (user.password !== password) {
      return response.error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      // Logic for reactivation could go here, for now just deny
      return response.error(res, 'Account is deactivated. Please contact support.', 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateJWT(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    response.error(res, error.message, 500);
  }
};

// GitHub OAuth Signup/Login
const githubAuth = async (req, res) => {
  try {
    const { githubId, username, email, avatar, accessToken } = req.body;

    if (!githubId) {
      return response.error(res, 'GitHub ID is required', 400);
    }

    let user = await User.findOne({ githubId });

    if (user) {
      // Update existing user
      user.githubAccessToken = accessToken;
      if (avatar) user.avatar = avatar;
      user.lastLogin = new Date();
      if (!user.isActive) user.isActive = true; // Auto-reactivate on login?
      await user.save();
    } else {
      // Check if email exists to link accounts
      if (email) {
        const emailUser = await User.findOne({ email });
        if (emailUser) {
          user = emailUser;
          user.githubId = githubId;
          user.githubAccessToken = accessToken;
          user.avatar = avatar || user.avatar;
          await user.save();
        }
      }

      if (!user) {
        // Create new user
        user = new User({
          username: username || `githubuser_${githubId}`,
          email: email || `${githubId}@github.temp`,
          githubId,
          githubAccessToken: accessToken,
          avatar,
          role: 'USER',
          coins: 0,
          avatarId: 1,
        });
        await user.save();
      }
    }

    const token = generateJWT(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'GitHub authentication successful');
  } catch (error) {
    console.error('GitHub Auth error:', error);
    response.error(res, error.message, 500);
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
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;

    let user = await User.findOne({
      $or: [{ githubId: githubUser.id.toString() }, { email: githubUser.email }]
    });

    if (user) {
      user.githubId = githubUser.id.toString();
      user.githubAccessToken = accessToken;
      user.avatar = githubUser.avatar_url;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email || `${githubUser.id}@github.temp`, // Handle null email
        avatar: githubUser.avatar_url,
        githubAccessToken: accessToken,
        role: 'USER',
        coins: 0,
        avatarId: 1,
      });
      await user.save();
    }

    const token = generateJWT(user._id);
    const userResponseData = user.toObject();
    delete userResponseData.password;

    response.success(res, { user: userResponseData, token }, 'GitHub authentication successful');
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    response.error(res, error.message || 'GitHub authentication failed', 500);
  }
};

// Google OAuth Callback
const googleCallback = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return response.error(res, 'Credential is required', 400);

    const tokenVerificationResponse = await axios.post(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (tokenVerificationResponse.status !== 200) {
      return response.error(res, 'Invalid credential', 401);
    }

    const { email, name, picture, sub } = tokenVerificationResponse.data;

    let user = await User.findOne({ email });

    if (user) {
      user.googleId = sub;
      if (!user.avatar) user.avatar = picture;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        email,
        username: name || email.split('@')[0],
        googleId: sub,
        avatar: picture,
        role: 'USER',
        coins: 0,
        avatarId: 1,
      });
      await user.save();
    }

    const token = generateJWT(user._id);
    const userResponseData = user.toObject();
    delete userResponseData.password;

    response.success(res, { user: userResponseData, token }, 'Google authentication successful');
  } catch (error) {
    console.error('Google OAuth error:', error);
    response.error(res, error.message || 'Google authentication failed', 500);
  }
};

// Logout
const logout = (req, res) => {
  response.success(res, {}, 'Logout successful');
};

module.exports = { signup, login, githubAuth, githubCallback, logout, googleCallback };
