/**
 * GitHub Controller
 * Handles OAuth callback and repository fetching
 */

const githubService = require('../services/github.service');
const DatabaseService = require('../services/mongo.service');
const response = require('../utils/response.util');
const { generateJWT } = require('../utils/jwt.util');

// GitHub OAuth callback
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return response.error(res, 'Authorization code not provided', 400);
    }

    console.log('GitHub callback - exchanging code for token...');

    // Exchange code for access token
    const tokenData = await githubService.getAccessToken(code);
    console.log('Token exchange successful');

    const { access_token } = tokenData;
    const githubUser = tokenData.user || tokenData;

    // Get GitHub user info if not included in token response
    let userInfo = githubUser;
    if (!githubUser.login) {
      console.log('Fetching GitHub user info...');
      userInfo = await githubService.getGitHubUser(access_token);
    }

    console.log('GitHub user:', userInfo.login);

    // For now, we'll update the existing logged-in user's GitHub token
    // In a real app, you'd match by GitHub ID or create a new user

    response.success(res, {
      githubUser: {
        githubId: userInfo.id,
        username: userInfo.login,
        email: userInfo.email,
        avatar: userInfo.avatar_url,
      },
      githubAccessToken: access_token,
    }, 'GitHub authentication successful');
  } catch (error) {
    console.error('GitHub callback error:', error);
    response.error(res, error.message || 'GitHub authentication failed', 500);
  }
};

// Link GitHub account to current authenticated user
const linkGitHubAccount = async (req, res) => {
  try {
    const { githubAccessToken, githubUser } = req.body;
    const userId = req.user._id;

    if (!githubAccessToken) {
      return response.error(res, 'GitHub access token required', 400);
    }

    // Update user in Firestore with GitHub info
    const updateData = {
      githubAccessToken,
      githubId: githubUser?.githubId,
      username: githubUser?.username,
      updatedAt: new Date(),
    };

    // Fix the email id based on GitHub account if provided
    if (githubUser?.email) {
      updateData.email = githubUser.email;
    }

    await DatabaseService.updateUser(userId, updateData);

    // Generate new JWT token with updated user info
    const token = generateJWT(userId);

    response.success(res, {
      message: 'GitHub account linked successfully',
      token, // Return JWT token for frontend to store
    }, 'GitHub account linked');
  } catch (error) {
    console.error('Link GitHub account error:', error);
    response.error(res, error.message || 'Failed to link GitHub account', 500);
  }
};

// Fetch user repositories from GitHub
const fetchRepositories = async (req, res) => {
  try {
    console.log('=== Fetch Repositories Request ===');

    // Get GitHub token from Authorization header
    const authHeader = req.headers.authorization;
    const githubToken = authHeader?.split(' ')[1];

    if (!githubToken) {
      console.error('No GitHub token provided in Authorization header');
      return response.error(res, 'No GitHub token provided. Please authenticate with GitHub first.', 401);
    }

    console.log('GitHub token received (first 10 chars):', githubToken.substring(0, 10));
    console.log('Fetching repositories from GitHub...');

    const repos = await githubService.fetchUserRepositories(githubToken);
    console.log('Repositories fetched successfully:', repos.length);

    response.success(res, { repositories: repos }, 'Repositories fetched successfully');
  } catch (error) {
    console.error('Error fetching repositories:', error);
    if (error.response?.status === 401) {
      response.error(res, 'GitHub token invalid or expired. Please authenticate again.', 401);
    } else {
      response.error(res, error.message || 'Failed to fetch repositories', 500);
    }
  }
};

// Connect repository
const connectRepository = async (req, res) => {
  try {
    const { repoId, repoName, fullName, owner, private: isPrivate, language, description } = req.body;
    const userId = req.user._id.toString();
    const accessToken = req.user.accessToken;

    if (!repoId || !repoName || !fullName) {
      return response.error(res, 'Repository ID, name, and full name are required', 400);
    }

    // Get all user repositories from Firestore
    const userRepos = await DatabaseService.getUserRepositories(userId);

    // Check if repository already exists
    const existingRepo = userRepos.find(r => r.githubRepoId === repoId.toString());

    let repoDocId;
    const repoData = {
      userId: userId,
      githubRepoId: repoId.toString(),
      name: repoName,
      fullName: fullName,
      owner: owner,
      isPrivate: isPrivate || false,
      language: language,
      description: description,
      isConnected: true,
      isActive: true,
      lastSync: new Date(),
    };

    if (!existingRepo) {
      // Deactivate all other repos for this user
      for (const repo of userRepos) {
        if (repo.isActive) {
          await DatabaseService.saveRepository(repo.id, {
            ...repo,
            isActive: false,
          });
        }
      }

      // Create new repository in Firestore with auto-generated ID
      repoDocId = `repo_${userId}_${repoId}_${Date.now()}`;
      repoData.createdAt = new Date();
      await DatabaseService.saveRepository(repoDocId, repoData);
    } else {
      repoDocId = existingRepo.id;

      // Deactivate all other repos
      for (const repo of userRepos) {
        if (repo.id !== repoDocId && repo.isActive) {
          await DatabaseService.saveRepository(repo.id, {
            ...repo,
            isActive: false,
          });
        }
      }

      // Update existing repository
      await DatabaseService.saveRepository(repoDocId, repoData);
    }

    // Start background commit fetching and analysis
    setImmediate(async () => {
      try {
        const repoForAnalysis = {
          _id: repoDocId,
          userId: userId,
          githubRepoId: repoId.toString(),
          name: repoName,
          fullName: fullName,
          owner: owner,
        };
        await githubService.fetchAndAnalyzeCommits(repoForAnalysis, accessToken);
      } catch (error) {
        console.error('Background commit analysis error:', error);
      }
    });

    response.success(res, {
      repo: {
        _id: repoDocId,
        userId: userId,
        name: repoName,
        fullName: fullName,
        owner: owner,
        isActive: true,
      }
    }, 'Repository connected successfully. Analysis started in background.', 201);
  } catch (error) {
    console.error('Connect repository error:', error);
    response.error(res, error.message, 500);
  }
};

module.exports = { githubCallback, linkGitHubAccount, fetchRepositories, connectRepository };
