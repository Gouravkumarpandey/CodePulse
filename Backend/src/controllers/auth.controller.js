/**
 * Auth Controller
 * Handles user login, signup, and authentication
 */

const User = require('../models/User');
const { generateJWT } = require('../utils/jwt.util');
const response = require('../utils/response.util');
const axios = require('axios');
const GITHUB_CONFIG = require('../config/github');
const { admin } = require('../config/firebase');
const FirestoreService = require('../services/firestore.service');

// Email/Password Signup
const signup = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return response.error(res, 'Email, password, and username are required', 400);
    }

    // Validate role if provided
    const userRole = role && (role === 'ADMIN' || role === 'USER') ? role : 'USER';

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return response.error(res, 'User with this email already exists', 400);
    }

    // Create new user
    user = new User({
      email,
      password,
      username,
      role: userRole,
    });

    await user.save();

    // Save user to Firestore
    try {
      await FirestoreService.saveUser(user._id.toString(), {
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt || new Date(),
        status: user.status || 'ACTIVE',
      });
    } catch (firestoreError) {
      console.error('Failed to save user to Firestore:', firestoreError);
      // Continue even if Firestore save fails
    }

    const token = generateJWT(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'User created successfully', 201);
  } catch (error) {
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

    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, 'Invalid email or password', 401);
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return response.error(res, 'Invalid email or password', 401);
    }

    // Check if user is disqualified
    if (user.status === 'DISQUALIFIED') {
      return response.error(res, 'Your account has been disqualified. Please contact admin.', 403);
    }

    const token = generateJWT(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    response.success(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// GitHub OAuth Signup/Login
const githubAuth = async (req, res) => {
  try {
    const { githubId, username, email, avatar, accessToken } = req.body;

    if (!githubId || !accessToken) {
      return response.error(res, 'GitHub ID and access token are required', 400);
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ githubId }, { email }] });
    
    if (user) {
      // Update existing user
      user.githubId = githubId;
      user.accessToken = accessToken;
      user.avatar = avatar;
      if (!user.username) user.username = username;
      await user.save();
    } else {
      // Create new user
      user = new User({
        githubId,
        username,
        email: email || `${githubId}@github.temp`,
        avatar,
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
    
    const userResponse = user.toObject();
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

// Google OAuth Callback - Exchange code for access token
const googleCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return response.error(res, 'Authorization code is required', 400);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return response.error(res, 'Failed to obtain access token', 400);
    }

    // Fetch user data from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const googleUser = userResponse.data;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ] 
    });

    if (user) {
      // Update existing user
      user.googleId = googleUser.id;
      user.avatar = googleUser.picture;
      if (!user.username) user.username = googleUser.name || googleUser.email.split('@')[0];
      await user.save();
    } else {
      // Create new user
      user = new User({
        googleId: googleUser.id,
        username: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        avatar: googleUser.picture,
        role: 'USER',
      });
      await user.save();
    }

    const token = generateJWT(user._id);

    const userResponseData = user.toObject();
    delete userResponseData.password;

    response.success(res, { user: userResponseData, token }, 'Google authentication successful');
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    response.error(res, error.response?.data?.error_description || error.message || 'Google authentication failed', 500);
  }
};

// Google Firebase Authentication - Verify ID Token
const googleFirebaseAuth = async (req, res) => {
  try {
    const { idToken, email, displayName, photoURL, uid } = req.body;

    if (!idToken) {
      return response.error(res, 'Firebase ID token is required', 400);
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken) {
      return response.error(res, 'Invalid Firebase token', 401);
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: uid },
        { googleId: uid },
        { email: email || decodedToken.email }
      ] 
    });

    if (user) {
      // Update existing user
      if (!user.firebaseUid) user.firebaseUid = uid;
      if (!user.googleId) user.googleId = uid;
      user.avatar = photoURL || user.avatar;
      if (!user.username && displayName) user.username = displayName;
      if (!user.email && email) user.email = email;
      await user.save();
    } else {
      // Create new user
      user = new User({
        firebaseUid: uid,
        googleId: uid,
        username: displayName || email?.split('@')[0] || 'User',
        email: email || decodedToken.email,
        avatar: photoURL,
        role: 'USER',
      });
      await user.save();
    }

    const token = generateJWT(user._id);

    const userResponseData = user.toObject();
    delete userResponseData.password;

    response.success(res, { user: userResponseData, token }, 'Google Firebase authentication successful');
  } catch (error) {
    console.error('Google Firebase auth error:', error);
    response.error(res, error.message || 'Google Firebase authentication failed', 500);
  }
};

module.exports = { signup, login, githubAuth, githubCallback, logout, googleCallback, googleFirebaseAuth };
