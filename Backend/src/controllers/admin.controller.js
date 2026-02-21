/**
 * Admin Controller
 * Handles admin dashboard and global rules
 */

const FirestoreService = require('../services/firestore.service');
const response = require('../utils/response.util');
const timeUtil = require('../utils/time.util');

// Get admin settings
const getAdminSettings = async (req, res) => {
  try {
    let settings = await FirestoreService.getAdminSettings();

    if (!settings) {
      // Default settings if not in DB
      settings = {
        maxInactivityGapHours: 2, // Default to 2 hours as requested
        gracePeriodHours: 1,
        warningThresholdHours: 1.5,
        totalHackathonDurationHours: 48,
      };
      // Save defaults to avoid null on next call
      await FirestoreService.saveAdminSettings(settings);
    }

    response.success(res, { settings });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Update admin settings
const updateAdminSettings = async (req, res) => {
  try {
    const { maxInactivityGapHours, gracePeriodHours, warningThresholdHours, totalHackathonDurationHours } = req.body;

    const newSettings = {
      maxInactivityGapHours: parseFloat(maxInactivityGapHours) || 24,
      gracePeriodHours: parseFloat(gracePeriodHours) || 12,
      warningThresholdHours: parseFloat(warningThresholdHours) || 20,
      totalHackathonDurationHours: parseFloat(totalHackathonDurationHours) || 48,
    };

    const savedSettings = await FirestoreService.saveAdminSettings(newSettings);

    response.success(res, { settings: savedSettings }, 'Settings updated successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get all users with activity monitoring
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Fetch all users from Firestore
    const users = await FirestoreService.getAllUsers();

    // Basic in-memory pagination for now (scalable enough for < 1000 users)
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // Enrich with activity data if possible (e.g., last pulse)
    const enrichedUsers = await Promise.all(paginatedUsers.map(async (user) => {
      // Get fetch active repo or last commit for last pulse
      const activeRepo = await FirestoreService.getActiveRepository(user.id);
      let lastCommitDate = null;
      if (activeRepo) {
        const recentCommits = await FirestoreService.getCommitsByRepo(activeRepo.id, 1);
        if (recentCommits.length > 0) {
          lastCommitDate = recentCommits[0].commitDate;
        }
      }

      return {
        ...user,
        lastPulse: lastCommitDate ? timeUtil.timeAgo(lastCommitDate) : 'Never',
        activeRepoName: activeRepo ? activeRepo.name : null
      };
    }));

    response.success(res, {
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get user activity monitoring table
const getUserActivityMonitoring = async (req, res) => {
  try {
    // Fetch all users (mocking for now as getAllUsers not in service)
    // const users = await FirestoreService.getAllUsers(); 
    const users = []; // Empty for safety until method exists

    const settings = await FirestoreService.getAdminSettings();
    const maxGap = settings?.maxInactivityGapHours || 24;

    const activityData = [];
    // Logic to iterate users and check repo status would go here, similar to Mongoose version but using Firestore calls.

    response.success(res, { activities: activityData });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get detailed user activity
const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Get active repository
    const activeRepo = await FirestoreService.getActiveRepository(userId);

    // Get all commits
    const commits = activeRepo
      ? await FirestoreService.getCommitsByRepo(activeRepo.id, 100)
      : [];

    // Admin Actions - would need a new collection/service method
    const adminActions = [];

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

    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Update user status
    const previousStatus = user.status;
    const updates = {
      warningCount: (user.warningCount || 0) + 1,
      status: user.status === 'ACTIVE' ? 'WARNING' : user.status
    };

    await FirestoreService.updateUser(userId, updates);

    // Log action - need service method
    // await FirestoreService.logUserAction({...});

    response.success(res, { user: { ...user, ...updates } }, 'Warning issued successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const setObservation = async (req, res) => {
  try {
    const { userId, isUnderObservation, notes } = req.body;

    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    await FirestoreService.updateUser(userId, { isUnderObservation });

    response.success(res, { user: { ...user, isUnderObservation } }, 'Observation status updated');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const disqualifyUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const updates = {
      status: 'DISQUALIFIED',
      disqualifiedAt: new Date(),
      disqualificationReason: reason
    };

    await FirestoreService.updateUser(userId, updates);

    response.success(res, { user: { ...user, ...updates } }, 'User disqualified successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const reactivateUser = async (req, res) => {
  try {
    const { userId, notes } = req.body;

    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    const updates = {
      status: 'ACTIVE',
      disqualifiedAt: null,
      disqualificationReason: null,
      warningCount: 0,
      violationCount: 0
    };

    await FirestoreService.updateUser(userId, updates);

    response.success(res, { user: { ...user, ...updates } }, 'User reactivated successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get activity violations
const getActivityViolations = async (req, res) => {
  try {
    const violations = await FirestoreService.getGlobalViolations(50);
    response.success(res, { violations });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get Dashboard Stats (New Endpoint)
const getDashboardStats = async (req, res) => {
  try {
    const users = await FirestoreService.getAllUsers();
    const recentActivity = await FirestoreService.getGlobalRecentActivity(100);
    const violations = await FirestoreService.getGlobalViolations(100);

    const activeNow = users.filter(u => u.status === 'ACTIVE').length;

    // Calculate average score (coins) across all users
    const avgScore = users.length > 0
      ? Math.round(users.reduce((sum, u) => sum + (u.coins || 0), 0) / users.length)
      : 0;

    // Count commits today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const commitsToday = recentActivity.filter(a => new Date(a.commitDate) >= startOfDay).length;

    // Aggregate chart data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const count = recentActivity.filter(a => {
        const commitDate = new Date(a.commitDate);
        return commitDate >= dayStart && commitDate < dayEnd;
      }).length;

      chartData.push({ name: dateStr, commits: count });
    }

    response.success(res, {
      stats: [
        { label: 'Total Players', value: users.length.toString(), icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Now', value: activeNow.toString(), icon: 'Activity', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Violations', value: violations.length.toString(), icon: 'AlertTriangle', color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Commits Today', value: commitsToday.toString(), icon: 'Zap', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Avg Score', value: avgScore.toString(), icon: 'ShieldAlert', color: 'text-orange-600', bg: 'bg-orange-50' },
      ],
      liveFeed: recentActivity.slice(0, 10).map(activity => ({
        id: activity.id,
        type: activity.status === 'VIOLATION' ? 'VIOLATION' : 'COMMIT',
        user: activity.committerName || 'Unknown',
        repo: activity.repoName || 'repo',
        time: timeUtil.timeAgo(activity.commitDate),
        bg: activity.status === 'VIOLATION' ? 'bg-red-50' : 'bg-green-50',
        color: activity.status === 'VIOLATION' ? 'text-red-700' : 'text-green-700'
      })),
      chartData
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Hackathon Management
const startHackathon = async (req, res) => {
  try {
    const result = await FirestoreService.startHackathon();
    response.success(res, result, 'Hackathon started successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const endHackathon = async (req, res) => {
  try {
    const result = await FirestoreService.endHackathon();
    response.success(res, result, 'Hackathon ended successfully');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

const getHackathonStatus = async (req, res) => {
  try {
    const status = await FirestoreService.getHackathonStatus();
    response.success(res, status);
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
  getDashboardStats,
  startHackathon,
  endHackathon,
  getHackathonStatus
};
