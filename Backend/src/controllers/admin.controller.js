/**
 * Admin Controller
 * Handles admin dashboard and global rules
 */

const User = require('../models/User');
const AdminSettings = require('../models/AdminSettings');
const Commit = require('../models/Commit');
const Repo = require('../models/Repo');
const UserAction = require('../models/UserAction');
const response = require('../utils/response.util');
const timeUtil = require('../utils/time.util');

// Get admin settings
const getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    response.success(res, { settings });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Update admin settings
const updateAdminSettings = async (req, res) => {
  try {
    const { maxInactivityGapHours, gracePeriodHours, warningThresholdHours } = req.body;

    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    if (maxInactivityGapHours) settings.maxInactivityGapHours = maxInactivityGapHours;
    if (gracePeriodHours) settings.gracePeriodHours = gracePeriodHours;
    if (warningThresholdHours) settings.warningThresholdHours = warningThresholdHours;
    settings.updatedBy = req.user._id;

    await settings.save();
    response.success(res, { settings }, 'Settings updated successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get all users with activity monitoring
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -accessToken -refreshToken')
      .skip(skip)
      .limit(limit);

    // Enrich with activity data
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const userObj = user.toObject();
      
      // Get active repository
      const activeRepo = await Repo.findOne({ userId: user._id, isActive: true });
      
      if (activeRepo) {
        // Get last commit
        const lastCommit = await Commit.findOne({ repoId: activeRepo._id })
          .sort({ commitDate: -1 });
        
        const settings = await AdminSettings.findOne();
        const maxGap = settings?.maxInactivityGapHours || 24;
        
        userObj.repository = {
          name: activeRepo.name,
          fullName: activeRepo.fullName,
          lastCommitDate: lastCommit?.commitDate,
          currentGap: lastCommit ? timeUtil.getGapInHours(lastCommit.commitDate, new Date()) : null,
          allowedGap: maxGap,
        };
      }
      
      return userObj;
    }));

    const total = await User.countDocuments();

    response.success(res, { users: enrichedUsers, pagination: { page, limit, total } });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get user activity monitoring table
const getUserActivityMonitoring = async (req, res) => {
  try {
    const users = await User.find({ role: 'USER' })
      .select('-password -accessToken -refreshToken');

    const settings = await AdminSettings.findOne();
    const maxGap = settings?.maxInactivityGapHours || 24;

    const activityData = await Promise.all(users.map(async (user) => {
      const activeRepo = await Repo.findOne({ userId: user._id, isActive: true });
      
      if (!activeRepo) {
        return {
          userId: user._id,
          username: user.username,
          email: user.email,
          status: user.status,
          repository: null,
          lastCommit: null,
          currentGap: null,
          allowedGap: maxGap,
          complianceStatus: '⚪ No Repository',
        };
      }

      const lastCommit = await Commit.findOne({ repoId: activeRepo._id })
        .sort({ commitDate: -1 });

      const currentGap = lastCommit 
        ? timeUtil.getGapInHours(lastCommit.commitDate, new Date())
        : null;

      let complianceStatus = '✅ Compliant';
      if (currentGap) {
        if (currentGap > maxGap + (settings?.gracePeriodHours || 0)) {
          complianceStatus = '❌ Violation';
        } else if (currentGap > (settings?.warningThresholdHours || 20)) {
          complianceStatus = '⚠ Warning';
        }
      }

      return {
        userId: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
        warningCount: user.warningCount,
        violationCount: user.violationCount,
        isUnderObservation: user.isUnderObservation,
        repository: {
          name: activeRepo.name,
          fullName: activeRepo.fullName,
        },
        lastCommit: lastCommit ? {
          message: lastCommit.message,
          date: lastCommit.commitDate,
          timeAgo: timeUtil.formatDuration(currentGap),
        } : null,
        currentGap,
        allowedGap: maxGap,
        complianceStatus,
      };
    }));

    response.success(res, { activities: activityData });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get detailed user activity
const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -accessToken -refreshToken');
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Get active repository
    const activeRepo = await Repo.findOne({ userId, isActive: true });
    
    // Get all commits
    const commits = activeRepo 
      ? await Commit.find({ repoId: activeRepo._id }).sort({ commitDate: -1 }).limit(100)
      : [];

    // Get admin actions on this user
    const adminActions = await UserAction.find({ userId })
      .populate('adminId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate statistics
    const violations = commits.filter(c => c.status === 'VIOLATION');
    const warnings = commits.filter(c => c.status === 'WARNING');

    response.success(res, {
      user,
      repository: activeRepo,
      commits,
      adminActions,
      statistics: {
        totalCommits: commits.length,
        violations: violations.length,
        warnings: warnings.length,
      },
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Admin Actions
const issueWarning = async (req, res) => {
  try {
    const { userId, reason, commitId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Update user
    const previousStatus = user.status;
    user.warningCount += 1;
    if (user.status === 'ACTIVE') {
      user.status = 'WARNING';
    }
    await user.save();

    // Log action
    const action = new UserAction({
      userId,
      adminId: req.user._id,
      actionType: 'WARNING',
      reason,
      relatedCommitId: commitId,
      metadata: {
        previousStatus,
        newStatus: user.status,
      },
    });
    await action.save();

    response.success(res, { user, action }, 'Warning issued successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const setObservation = async (req, res) => {
  try {
    const { userId, isUnderObservation, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    user.isUnderObservation = isUnderObservation;
    await user.save();

    // Log action
    const action = new UserAction({
      userId,
      adminId: req.user._id,
      actionType: 'OBSERVATION',
      reason: isUnderObservation ? 'Placed under observation' : 'Removed from observation',
      notes,
    });
    await action.save();

    response.success(res, { user, action }, 'Observation status updated');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const disqualifyUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const previousStatus = user.status;
    user.status = 'DISQUALIFIED';
    user.disqualifiedAt = new Date();
    user.disqualificationReason = reason;
    await user.save();

    // Log action
    const action = new UserAction({
      userId,
      adminId: req.user._id,
      actionType: 'DISQUALIFICATION',
      reason,
      metadata: {
        previousStatus,
        newStatus: 'DISQUALIFIED',
      },
    });
    await action.save();

    response.success(res, { user, action }, 'User disqualified successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const reactivateUser = async (req, res) => {
  try {
    const { userId, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const previousStatus = user.status;
    user.status = 'ACTIVE';
    user.disqualifiedAt = null;
    user.disqualificationReason = null;
    user.warningCount = 0;
    user.violationCount = 0;
    await user.save();

    // Log action
    const action = new UserAction({
      userId,
      adminId: req.user._id,
      actionType: 'REACTIVATION',
      reason: 'User reactivated',
      notes,
      metadata: {
        previousStatus,
        newStatus: 'ACTIVE',
      },
    });
    await action.save();

    response.success(res, { user, action }, 'User reactivated successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get activity violations
const getActivityViolations = async (req, res) => {
  try {
    const violations = await Commit.find({ status: 'VIOLATION' })
      .populate('userId', 'username email status')
      .populate('repoId', 'name fullName')
      .limit(100)
      .sort({ createdAt: -1 });

    response.success(res, { violations });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

module.exports = {
  getAdminSettings,
  updateAdminSettings,
  getAllUsers,
  getUserActivityMonitoring,
  getUserDetail,
  issueWarning,
  setObservation,
  disqualifyUser,
  reactivateUser,
  getActivityViolations,
};
