const FirestoreService = require('../services/firestore.service');
const response = require('../utils/response.util');
const crypto = require('crypto');

// Mock email service for now
const sendEmail = async (to, subject, text) => {
  console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
  return Promise.resolve();
};

const getGapInHours = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return diff / (1000 * 60 * 60);
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await FirestoreService.getUser(req.user.id);

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Remove sensitive data
    delete user.password;
    delete user.otp;
    delete user.otpExpires;
    delete user.githubAccessToken;

    response.success(res, { user });
  } catch (error) {
    console.error('getUserProfile error:', error);
    response.error(res, error.message, 500);
  }
};

// Get active repository with overview
const getActiveRepository = async (req, res) => {
  try {
    const activeRepo = await FirestoreService.getActiveRepository(req.user.id);

    if (!activeRepo) {
      return response.success(res, { repository: null }, 'No active repository');
    }

    // Get last commit
    const commits = await FirestoreService.getCommitsByRepo(activeRepo.id, 1);
    const lastCommit = commits.length > 0 ? commits[0] : null;

    // Default settings
    const settings = { maxInactivityGapHours: 24, gracePeriodHours: 12, warningThresholdHours: 20 };
    const maxGap = settings.maxInactivityGapHours;

    // Calculate current gap
    const currentGap = lastCommit
      ? getGapInHours(lastCommit.commitDate, new Date())
      : null;

    // Determine status
    let status = 'COMPLIANT';
    if (currentGap) {
      if (currentGap > maxGap + settings.gracePeriodHours) {
        status = 'VIOLATION';
      } else if (currentGap > settings.warningThresholdHours) {
        status = 'WARNING';
      }
    }

    const overview = {
      repository: activeRepo,
      lastCommit: lastCommit ? {
        message: lastCommit.message,
        date: lastCommit.commitDate,
        author: lastCommit.author,
        sha: lastCommit.commitSha,
      } : null,
      currentInactivityGap: currentGap,
      allowedGap: maxGap,
      status,
      rules: settings,
    };

    response.success(res, { overview });
  } catch (error) {
    console.error('getActiveRepository error:', error);
    response.error(res, error.message, 500);
  }
};

// Get user repositories
const getUserRepositories = async (req, res) => {
  try {
    const repos = await FirestoreService.getUserRepositories(req.user.id);
    // Sort by createdAt desc locally since Firestore sorting might need composite index
    repos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    response.success(res, { repositories: repos });
  } catch (error) {
    console.error('getUserRepositories error:', error);
    response.error(res, error.message, 500);
  }
};

// Set active repository
const setActiveRepository = async (req, res) => {
  try {
    const { repoId } = req.body;
    const userId = req.user.id;

    // Verify repo ownership
    const repo = await FirestoreService.getRepository(repoId);
    if (!repo || repo.userId !== userId) {
      return response.error(res, 'Repository not found or unauthorized', 404);
    }

    // Deactivate all repos for this user first
    const allRepos = await FirestoreService.getUserRepositories(userId);
    const batchOps = [];

    allRepos.forEach(r => {
      // Deactivate others, set target to active
      if (r.id === repoId) {
        if (!r.isActive) {
          batchOps.push({
            collection: 'repositories',
            docId: r.id,
            type: 'update',
            data: { isActive: true, updatedAt: new Date() }
          });
        }
      } else {
        if (r.isActive) {
          batchOps.push({
            collection: 'repositories',
            docId: r.id,
            type: 'update',
            data: { isActive: false, updatedAt: new Date() }
          });
        }
      }
    });

    if (batchOps.length > 0) {
      await FirestoreService.batchWrite(batchOps);
    }

    // Refetch to return fresh state
    const updatedRepo = await FirestoreService.getRepository(repoId);

    response.success(res, { repository: updatedRepo }, 'Active repository updated');
  } catch (error) {
    console.error('setActiveRepository error:', error);
    response.error(res, error.message, 500);
  }
};

// Delete repository
const deleteRepository = async (req, res) => {
  try {
    const { repoId } = req.params;
    const userId = req.user.id;

    const repo = await FirestoreService.getRepository(repoId);
    if (!repo || repo.userId !== userId) {
      return response.error(res, 'Repository not found or unauthorized', 404);
    }

    // Delete repo
    await FirestoreService.deleteRepository(repoId);

    // Note: Deleting all commits for a repo in Firestore is expensive (read then delete).
    // For now, we might leave them orphaned or delete them if critical.
    // Ideally use cloud function for cleanup.
    // For this implementation, we will skip bulk commit deletion to avoid timeout.

    response.success(res, null, 'Repository deleted successfully');
  } catch (error) {
    console.error('deleteRepository error:', error);
    response.error(res, error.message, 500);
  }
};

// Update user profile (Settings)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const allowedUpdates = {};

    // Filter allowed fields
    if (updateData.username) allowedUpdates.username = updateData.username;
    if (updateData.avatarId !== undefined) allowedUpdates.avatarId = updateData.avatarId;

    // Handle settings
    let currentSettings = {};
    const user = await FirestoreService.getUser(userId);
    if (user && user.settings) currentSettings = { ...user.settings };

    if (updateData.settings) {
      currentSettings = { ...currentSettings, ...updateData.settings };
    }
    // Backward compatibility for root level settings params
    if (updateData.inactivityAlert !== undefined) currentSettings.inactivityAlert = updateData.inactivityAlert;
    if (updateData.burstCommitWarning !== undefined) currentSettings.burstCommitWarning = updateData.burstCommitWarning;
    if (updateData.emailNotifications !== undefined) currentSettings.emailNotifications = updateData.emailNotifications;

    if (Object.keys(currentSettings).length > 0) {
      allowedUpdates.settings = currentSettings;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return response.success(res, { user }, 'No changes detected');
    }

    const updatedUser = await FirestoreService.updateUser(userId, allowedUpdates);
    delete updatedUser.password;

    response.success(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    console.error('updateUserProfile error:', error);
    response.error(res, error.message, 500);
  }
};

// Generate and Send OTP
const sendOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await FirestoreService.getUser(userId);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    await FirestoreService.updateUser(userId, { otp, otpExpires });

    await sendEmail(user.email, 'Security Verification OTP', `Your OTP is: ${otp}. It expires in 5 minutes.`);

    response.success(res, { message: 'OTP sent to your email' });
  } catch (error) {
    console.error('sendOtp error:', error);
    response.error(res, error.message, 500);
  }
};

// Deactivate Account
const deactivateAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const user = await FirestoreService.getUser(userId);

    const now = new Date();
    const expires = new Date(user.otpExpires);

    if (!user.otp || !user.otpExpires || user.otp !== otp || expires < now) {
      return response.error(res, 'Invalid or expired OTP', 400);
    }

    await FirestoreService.updateUser(userId, {
      isActive: false,
      otp: null,
      otpExpires: null
    });

    response.success(res, null, 'Account deactivated successfully');
  } catch (error) {
    console.error('deactivateAccount error:', error);
    response.error(res, error.message, 500);
  }
};

// Delete Account
const deleteUserAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    const user = await FirestoreService.getUser(userId);

    const now = new Date();
    const expires = new Date(user.otpExpires);

    if (!user.otp || !user.otpExpires || user.otp !== otp || expires < now) {
      return response.error(res, 'Invalid or expired OTP', 400);
    }

    // Soft delete / Mark inactive
    await FirestoreService.updateUser(userId, {
      isDeleted: true,
      isActive: false,
      otp: null,
      otpExpires: null
    });

    response.success(res, null, 'Account marked for deletion');
  } catch (error) {
    console.error('deleteUserAccount error:', error);
    response.error(res, error.message, 500);
  }
};

// Get repository activity (commit timeline)
const getRepositoryActivity = async (req, res) => {
  try {
    const { repoId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Verify ownership/access if strictly private
    // For now we assume repoId knowledge implies access or it's public enough for the user context

    const commits = await FirestoreService.getCommitsByRepo(repoId, limit);

    // Get analysis from Firestore
    const analysis = await FirestoreService.getRepoAnalysis(repoId);

    response.success(res, {
      commits: commits,
      summary: analysis || {}
    });
  } catch (error) {
    console.error('getRepositoryActivity error:', error);
    response.error(res, error.message, 500);
  }
};

// Get warnings and violations
const getWarningsAndViolations = async (req, res) => {
  try {
    const userId = req.user.id;
    const repos = await FirestoreService.getUserRepositories(userId);
    const repoIds = repos.map(r => r.id);

    if (repoIds.length === 0) {
      return response.success(res, { warnings: [], violations: [] });
    }

    // Firestore limit for 'in' is 10. If more than 10, strictly we should split.
    // For MVP/Demo, we take top 10 most recent repos
    const targetRepoIds = repoIds.slice(0, 10);

    const warnings = await FirestoreService.getCommitsByStatus(targetRepoIds, 'WARNING', 50);
    const violations = await FirestoreService.getCommitsByStatus(targetRepoIds, 'VIOLATION', 50);

    response.success(res, { warnings, violations });
  } catch (error) {
    console.error('getWarningsAndViolations error:', error);
    response.error(res, error.message, 500);
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await FirestoreService.getUser(userId);
    const repos = await FirestoreService.getUserRepositories(userId);

    // Calculate stats
    // Note: without aggregation queries in Firestore (which are newer/expensive or require specific indexes),
    // we might just estimate or iterate if small. 
    // Or we rely on repoAnalysis documents if we were summarizing them.
    // For now, let's iterate repos to find active one and just count repos.
    // Detailed commit stats across ALL repos is expensive in Firestore.
    // We will just return user stats and repo counts.

    const activeRepo = repos.find(r => r.isActive);

    let totalCommits = 0; // This would be hard to get efficiently without counter fields
    // If we have totalCommits in user profile or repo analysis, use that.
    // user.totalCommits might be maintained?

    response.success(res, {
      summary: {
        totalRepositories: repos.length,
        activeRepository: activeRepo ? activeRepo.name : null,
        totalCommits: user.totalCommits || 0, // Assume we track this
        userStatus: user.isActive ? 'ACTIVE' : 'INACTIVE',
        coins: user.coins || 0,
        avatarId: user.avatarId || 1,
      },
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    response.error(res, error.message, 500);
  }
};

// Get admin rules
const getAdminRules = async (req, res) => {
  try {
    // Mock or fetch from Firestore adminSettings
    const settings = await FirestoreService.getAdminSettings();
    const rules = settings || {
      maxInactivityGapHours: 2,
      gracePeriodHours: 1,
      warningThresholdHours: 1.5,
      totalHackathonDurationHours: 48,
    };

    response.success(res, { rules });
  } catch (error) {
    console.error('getAdminRules error:', error);
    response.error(res, error.message, 500);
  }
};

const getHackathonStatus = async (req, res) => {
  try {
    const status = await FirestoreService.getHackathonStatus();
    response.success(res, status);
  } catch (error) {
    console.error('getHackathonStatus error:', error);
    response.error(res, error.message, 500);
  }
};

module.exports = {
  getUserProfile,
  getActiveRepository,
  getUserRepositories,
  setActiveRepository,
  deleteRepository,
  updateUserProfile,
  sendOtp,
  deactivateAccount,
  deleteUserAccount,
  getRepositoryActivity,
  getWarningsAndViolations,
  getDashboardSummary,
  getAdminRules,
  getHackathonStatus
};
