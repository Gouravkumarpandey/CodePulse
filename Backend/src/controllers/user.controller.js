const User = require('../models/User');
const Repo = require('../models/Repo');
const Commit = require('../models/Commit');
const response = require('../utils/response.util');
const timeUtil = require('../utils/time.util');
const crypto = require('crypto');

// Helper to send email (Mock)
const sendEmail = async (email, subject, text) => {
  console.log(`\n=== MOCK EMAIL ===\nTo: ${email}\nSubject: ${subject}\nBody: ${text}\n==================\n`);
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires');

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    response.success(res, { user });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get active repository with overview
const getActiveRepository = async (req, res) => {
  try {
    const activeRepo = await Repo.findOne({ userId: req.user._id, isActive: true });

    if (!activeRepo) {
      return response.success(res, { repository: null }, 'No active repository');
    }

    // Get last commit
    const lastCommit = await Commit.findOne({ repoId: activeRepo._id })
      .sort({ commitDate: -1 })
      .lean();

    // Default settings (since AdminSettings model usage is inconsistent, hardcode defaults for now)
    const settings = { maxInactivityGapHours: 24, gracePeriodHours: 12, warningThresholdHours: 20 };
    const maxGap = settings.maxInactivityGapHours;

    // Calculate current gap
    const currentGap = lastCommit
      ? timeUtil.getGapInHours(lastCommit.commitDate, new Date())
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
    response.error(res, error.message, 500);
  }
};

// Get user repositories
const getUserRepositories = async (req, res) => {
  try {
    const repos = await Repo.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

    const repo = await Repo.findOne({ _id: repoId, userId: req.user._id });
    if (!repo) {
      return response.error(res, 'Repository not found', 404);
    }

    // Deactivate all repos
    await Repo.updateMany({ userId: req.user._id }, { isActive: false });

    // Activate selected
    repo.isActive = true;
    await repo.save();

    response.success(res, { repository: repo }, 'Active repository updated');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Delete repository
const deleteRepository = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repo = await Repo.findOne({ _id: repoId, userId: req.user._id });
    if (!repo) {
      return response.error(res, 'Repository not found or unauthorized', 404);
    }

    // Delete repo and associated commits
    await Repo.deleteOne({ _id: repoId });
    await Commit.deleteMany({ repoId: repoId });

    response.success(res, null, 'Repository deleted successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Update user profile (Settings)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) return response.error(res, 'User not found', 404);

    if (updateData.username) user.username = updateData.username;
    if (updateData.avatarId) user.avatarId = updateData.avatarId;

    // Update settings object
    if (updateData.settings) {
      user.settings = { ...user.settings, ...updateData.settings };
    }

    // Compatibility: Map 'notifications' to 'settings'
    if (updateData.notifications) {
      user.settings = { ...user.settings, ...updateData.notifications };
    }

    // Handle specific toggles if sent flat
    if (updateData.inactivityAlert !== undefined) user.settings.inactivityAlert = updateData.inactivityAlert;
    if (updateData.burstCommitWarning !== undefined) user.settings.burstCommitWarning = updateData.burstCommitWarning;
    if (updateData.emailNotifications !== undefined) user.settings.emailNotifications = updateData.emailNotifications;

    await user.save();

    response.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Generate and Send OTP
const sendOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendEmail(user.email, 'Security Verification OTP', `Your OTP is: ${otp}. It expires in 5 minutes.`);

    response.success(res, { message: 'OTP sent to your email' });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Deactivate Account
const deactivateAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
      return response.error(res, 'Invalid or expired OTP', 400);
    }

    user.isActive = false;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    response.success(res, null, 'Account deactivated successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Delete Account (Permanent/Soft)
const deleteUserAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
      return response.error(res, 'Invalid or expired OTP', 400);
    }

    // Soft delete
    user.isDeleted = true;
    user.isActive = false;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Optionally: could handle hard delete here
    // await User.deleteOne({ _id: userId });
    // await Repo.deleteMany({ userId });
    // await Commit.deleteMany({ userId });

    response.success(res, null, 'Account marked for deletion');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get repository activity (commit timeline)
const getRepositoryActivity = async (req, res) => {
  try {
    const { repoId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const commits = await Commit.find({ repoId })
      .sort({ commitDate: -1 })
      .limit(limit)
      .lean();

    const formattedCommits = commits.map(commit => ({
      _id: commit._id,
      commitSha: commit.commitSha,
      message: commit.message,
      author: commit.author,
      commitDate: commit.commitDate,
      filesChanged: commit.filesChanged,
      additions: commit.additions,
      deletions: commit.deletions,
      branch: commit.branch,
      status: commit.status,
      inactivityGap: commit.inactivityGap,
    }));

    // In a real implementation, you'd calculate summary here or store it in RepoAnalysis
    const RepoAnalysis = require('../models/RepoAnalysis');
    const analysis = await RepoAnalysis.findOne({ repoId });

    response.success(res, {
      commits: formattedCommits,
      summary: analysis || {}
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get warnings and violations
const getWarningsAndViolations = async (req, res) => {
  try {
    const repos = await Repo.find({ userId: req.user._id }).select('_id');
    const repoIds = repos.map(r => r._id);

    if (repoIds.length === 0) {
      return response.success(res, { warnings: [], violations: [] });
    }

    const warnings = await Commit.find({
      repoId: { $in: repoIds },
      status: 'WARNING'
    }).sort({ commitDate: -1 }).limit(50).lean();

    const violations = await Commit.find({
      repoId: { $in: repoIds },
      status: 'VIOLATION'
    }).sort({ commitDate: -1 }).limit(50).lean();

    response.success(res, { warnings, violations });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const repos = await Repo.find({ userId });
    const activeRepo = repos.find(r => r.isActive);
    const repoIds = repos.map(r => r._id);

    const commitStats = await Commit.aggregate([
      { $match: { repoId: { $in: repoIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let totalCommits = 0;
    let violations = 0;
    let warnings = 0;

    commitStats.forEach(stat => {
      totalCommits += stat.count;
      if (stat._id === 'VIOLATION') violations = stat.count;
      if (stat._id === 'WARNING') warnings = stat.count;
    });

    response.success(res, {
      summary: {
        totalRepositories: repos.length,
        activeRepository: activeRepo ? activeRepo.name : null,
        totalCommits,
        violations,
        warnings,
        userStatus: user.isActive ? 'ACTIVE' : 'INACTIVE',
        coins: user.coins || 0,
        avatarId: user.avatarId || 1,
      },
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get admin rules (mock for now, or fetch from AdminSettings model if you restore it)
const getAdminRules = async (req, res) => {
  // Hardcoded defaults as requested to avoid complex dependency restoration right now
  response.success(res, {
    rules: {
      maxInactivityGapHours: 24,
      gracePeriodHours: 12,
      warningThresholdHours: 20,
      totalAllowedGap: 36,
    },
  });
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
};
