/**
 * GitHub Controller
 * Handles OAuth callback and repository fetching
 */

const githubService = require('../services/github.service');
const FirestoreService = require('../services/firestore.service');
const response = require('../utils/response.util');

// GitHub OAuth callback
const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.user?._id;

    if (!code) {
      return response.error(res, 'Authorization code not provided', 400);
    }

    // Exchange code for access token
    const { access_token, user: githubUser } = await githubService.getAccessToken(code);

    // Find or create user
    let user = await User.findOne({ githubId: githubUser.id });
    if (!user) {
      user = new User({
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        avatar: githubUser.avatar_url,
        accessToken: access_token,
      });
      await user.save();
    } else {
      user.accessToken = access_token;
      await user.save();
    }

    response.success(res, { user, accessToken: access_token }, 'GitHub authentication successful');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Fetch user repositories
const fetchRepositories = async (req, res) => {
  try {
    const user = req.user;
    const repos = await githubService.fetchUserRepositories(user.accessToken);

    response.success(res, { repositories: repos }, 'Repositories fetched successfully');
  } catch (error) {
    response.error(res, error.message, 500);
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
    const userRepos = await FirestoreService.getUserRepositories(userId);
    
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
          await FirestoreService.saveRepository(repo.id, {
            ...repo,
            isActive: false,
          });
        }
      }
      
      // Create new repository in Firestore with auto-generated ID
      repoDocId = `repo_${userId}_${repoId}_${Date.now()}`;
      repoData.createdAt = new Date();
      await FirestoreService.saveRepository(repoDocId, repoData);
    } else {
      repoDocId = existingRepo.id;
      
      // Deactivate all other repos
      for (const repo of userRepos) {
        if (repo.id !== repoDocId && repo.isActive) {
          await FirestoreService.saveRepository(repo.id, {
            ...repo,
            isActive: false,
          });
        }
      }
      
      // Update existing repository
      await FirestoreService.saveRepository(repoDocId, repoData);
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

module.exports = { githubCallback, fetchRepositories, connectRepository };
