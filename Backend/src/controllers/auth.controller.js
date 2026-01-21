/**
 * Auth Controller
 * Handles user login, signup, and authentication
 */

// const User = require('../models/User'); // Removed MongoDB User model
const { generateJWT } = require('../utils/jwt.util');
const response = require('../utils/response.util');
const axios = require('axios');
const GITHUB_CONFIG = require('../config/github');
// const { admin } = require('../config/firebase'); // Firebase admin not needed for Google OAuth 2.0
const FirestoreService = require('../services/firestore.service');

// Email/Password Signup (Firestore only)
const signup = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username) {
      return response.error(res, 'Email, password, and username are required', 400);
    }

    const userRole = role && (role === 'ADMIN' || role === 'USER') ? role : 'USER';

    // Check if user exists in Firestore
    const existingUser = await FirestoreService.getUser(email);
    if (existingUser) {
      return response.error(res, 'User with this email already exists', 400);
    }

    // Save user to Firestore
    const userData = {
      email,
      password, // Consider hashing if needed, or remove if not required
      username,
      role: userRole,
      avatar: null,
      createdAt: new Date(),
      status: 'ACTIVE',
    };
    await FirestoreService.saveUser(email, userData);

    const token = generateJWT(email);
    const userResponse = { ...userData };
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'User created successfully', 201);
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Email/Password Login (Firestore only)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.error(res, 'Email and password are required', 400);
    }

    const user = await FirestoreService.getUser(email);
    if (!user) {
      return response.error(res, 'Invalid email or password', 401);
    }

    // Password check (plain, or hash if you implement it)
    if (user.password !== password) {
      return response.error(res, 'Invalid email or password', 401);
    }

    if (user.status === 'DISQUALIFIED') {
      return response.error(res, 'Your account has been disqualified. Please contact admin.', 403);
    }

    const token = generateJWT(user.email);
    const userResponse = { ...user };
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// GitHub OAuth Signup/Login (Firestore only)
const githubAuth = async (req, res) => {
  try {
    const { githubId, username, email, avatar, accessToken } = req.body;

    if (!githubId || !accessToken) {
      return response.error(res, 'GitHub ID and access token are required', 400);
    }

    // Use firebaseUid if available, otherwise use email or githubId
    const userId = req.body.firebaseUid || email || `github_${githubId}`;

    // Check if user exists in Firestore
    let user = await FirestoreService.getUser(userId);

    if (user) {
      // Update existing user with GitHub info
      user.githubId = githubId;
      user.githubAccessToken = accessToken; // Store GitHub token
      user.avatar = avatar || user.avatar;
      user.username = user.username || username;
      user.email = user.email || email;
      await FirestoreService.saveUser(userId, user);
    } else {
      // Create new user
      user = {
        githubId,
        username,
        email: email || `${githubId}@github.temp`,
        avatar,
        githubAccessToken: accessToken, // Store GitHub token
        role: 'USER',
        createdAt: new Date(),
        status: 'ACTIVE',
      };
      await FirestoreService.saveUser(userId, user);
    }

    const token = generateJWT(userId);
    const userResponse = { ...user };
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'GitHub authentication successful');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// GitHub OAuth Callback - Exchange code for access token
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return response.error(res, 'Authorization code is required', 400);
    }

    // Exchange code for access tokengithubCallback, 
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CONFIG.clientID,
        client_secret: GITHUB_CONFIG.clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return response.error(res, 'Failed to obtain access token', 400);
    }

    // Fetch user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = userResponse.data;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { githubId: githubUser.id.toString() },
        { email: githubUser.email }
      ] 
    });

    if (user) {
      // Update existing user
      user.githubId = githubUser.id.toString();
      user.accessToken = accessToken;
      user.avatar = githubUser.avatar_url;
      if (!user.username) user.username = githubUser.login;
      if (githubUser.email && !user.email) user.email = githubUser.email;
      await user.save();
    } else {
      // Create new user
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email || `${githubUser.id}@github.temp`,
        avatar: githubUser.avatar_url,
        accessToken,
        role: 'USER',
      });
      await user.save();
    }

    // Save/update user in Firestore
    try {
      await FirestoreService.saveUser(user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        githubId: user.githubId,
        avatar: user.avatar || null,
        createdAt: user.createdAt || new Date(),
        status: user.status || 'ACTIVE',
      });
    } catch (firestoreError) {
      console.error('Failed to save user to Firestore:', firestoreError);
    }

    const token = generateJWT(user._id);

    const userResponseData = user.toObject();
    delete userResponseData.password;
    delete userResponseData.accessToken;

    response.success(res, { user: userResponseData, token }, 'GitHub authentication successful');
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    response.error(res, error.message || 'GitHub authentication failed', 500);
  }
};

// Logout
const logout = (req, res) => {
  try {
    response.success(res, {}, 'Logout successful');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Google OAuth - Verify credential token from Google Sign-In library
const googleCallback = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return response.error(res, 'Credential is required', 400);
    }

    // Verify the credential token with Google
    const tokenVerificationResponse = await axios.post(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (tokenVerificationResponse.status !== 200) {
      return response.error(res, 'Invalid credential', 401);
    }

    const { email, name, picture, sub } = tokenVerificationResponse.data;

    if (!email) {
      return response.error(res, 'Email not found in Google account', 400);
    }

    // Check if user exists in Firestore
    let user = await FirestoreService.getUser(email);

    if (user) {
      // Update existing user
      user.googleId = sub;
      user.avatar = picture || user.avatar;
      if (!user.username) user.username = name || email.split('@')[0];
      await FirestoreService.saveUser(email, user);
    } else {
      // Create new user
      user = {
        googleId: sub,
        username: name || email.split('@')[0],
        email: email,
        avatar: picture,
        role: 'USER',
        createdAt: new Date(),
        status: 'ACTIVE',
      };
      await FirestoreService.saveUser(email, user);
    }

    const token = generateJWT(email);
    const userResponseData = { ...user };
    delete userResponseData.password;

    response.success(res, { user: userResponseData, token }, 'Google authentication successful');
  } catch (error) {
    console.error('Google OAuth error:', error);
    response.error(res, error.message || 'Google authentication failed', 500);
  }
};

// (Firebase Google Auth endpoint removed)

module.exports = { signup, login, githubAuth, githubCallback, logout, googleCallback };
