/**
 * User Controller  
 * Enhanced with repository overview and activity tracking
 */

const FirestoreService = require('../services/firestore.service');
const response = require('../utils/response.util');
const timeUtil = require('../utils/time.util');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await FirestoreService.getUser(req.user._id);

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Remove sensitive fields
    delete user.password;
    delete user.accessToken;
    delete user.refreshToken;

    response.success(res, { user });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get active repository with overview
const getActiveRepository = async (req, res) => {
  try {
    const activeRepo = await FirestoreService.getActiveRepository(req.user._id);

    if (!activeRepo) {
      return response.success(res, { repository: null }, 'No active repository');
    }

    // Get last commit
    const commits = await FirestoreService.getCommitsByRepo(activeRepo.id, 1);
    const lastCommit = commits.length > 0 ? commits[0] : null;

    // Get admin settings
    const settings = await FirestoreService.getAdminSettings();
    const maxGap = settings?.maxInactivityGapHours || 24;

    // Calculate current gap
    const currentGap = lastCommit 
      ? timeUtil.getGapInHours(lastCommit.commitDate, new Date())
      : null;

    // Determine status
    let status = 'COMPLIANT';
    if (currentGap) {
      if (currentGap > maxGap + (settings?.gracePeriodHours || 0)) {
        status = 'VIOLATION';
      } else if (currentGap > (settings?.warningThresholdHours || 20)) {
        status = 'WARNING';
      }
    }

    const overview = {
      repository: {
        name: activeRepo.name,
        fullName: activeRepo.fullName,
        url: activeRepo.url,
        description: activeRepo.description,
        language: activeRepo.language,
      },
      lastCommit: lastCommit ? {
        message: lastCommit.message,
        date: lastCommit.commitDate,
        author: lastCommit.author,
        sha: lastCommit.commitSha,
      } : null,
      currentInactivityGap: currentGap,
      allowedGap: maxGap,
      status,
      rules: {
        maxInactivityGap: maxGap,
        gracePeriod: settings?.gracePeriodHours || 0,
        warningThreshold: settings?.warningThresholdHours || 20,
      },
    };

    response.success(res, { overview });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get user repositories
const getUserRepositories = async (req, res) => {
  try {
    console.log('Getting repositories for user:', req.user._id);
    console.log('User object:', req.user);
    const userId = req.user._id.toString();
    console.log('User ID string:', userId);
    const repos = await FirestoreService.getUserRepositories(userId);
    console.log('Repos returned:', repos);
    response.success(res, { repositories: repos });
  } catch (error) {
    console.error('getUserRepositories error:', error);
    response.error(res, error.message, 500);
  }
};

// Set active repository (only one can be active)
const setActiveRepository = async (req, res) => {
  try {
    const { repoId } = req.body;

    const repos = await FirestoreService.getUserRepositories(req.user._id);
    const repo = repos.find(r => r.id === repoId);
    if (!repo) {
      return response.error(res, 'Repository not found', 404);
    }

    // Deactivate all repos and activate selected one
    const operations = repos.map(r => ({
      collection: 'repositories',
      docId: r.id,
      type: 'update',
      data: { isActive: r.id === repoId }
    }));

    await FirestoreService.batchWrite(operations);

    response.success(res, { repository: { ...repo, isActive: true } }, 'Active repository updated');
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get repository activity (commit timeline)
const getRepositoryActivity = async (req, res) => {
  try {
    const { repoId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const commits = await FirestoreService.getCommitsByRepo(repoId, limit);

    response.success(res, { commits });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get warnings and violations
const getWarningsAndViolations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all user's repositories
    const repos = await FirestoreService.getUserRepositories(userId);
    const repoIds = repos.map(r => r.id);

    if (repoIds.length === 0) {
      return response.success(res, { warnings: [], violations: [] });
    }

    // Get warnings and violations
    const warnings = await FirestoreService.getCommitsByStatus(repoIds, 'WARNING', 50);
    const violations = await FirestoreService.getCommitsByStatus(repoIds, 'VIOLATION', 50);

    response.success(res, { warnings, violations });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const repos = await FirestoreService.getUserRepositories(userId);
    const activeRepo = repos.find(r => r.isActive);
    const repoIds = repos.map(r => r.id);

    // Get user data
    const user = await FirestoreService.getUser(userId);

    // Count commits by status (simplified - could be optimized)
    let totalCommits = 0;
    let violations = 0;
    let warnings = 0;

    for (const repoId of repoIds) {
      const commits = await FirestoreService.getCommitsByRepo(repoId, 1000);
      totalCommits += commits.length;
      violations += commits.filter(c => c.status === 'VIOLATION').length;
      warnings += commits.filter(c => c.status === 'WARNING').length;
    }

    response.success(res, {
      summary: {
        totalRepositories: repos.length,
        activeRepository: activeRepo ? activeRepo.name : null,
        totalCommits,
        violations,
        warnings,
        userStatus: user?.status || 'ACTIVE',
        warningCount: user?.warningCount || 0,
        violationCount: user?.violationCount || 0,
        isUnderObservation: user?.isUnderObservation || false,
      },
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

// Get admin rules (read-only for users)
const getAdminRules = async (req, res) => {
  try {
    const settings = await FirestoreService.getAdminSettings();

    if (!settings) {
      return response.success(res, { 
        rules: {
          maxInactivityGapHours: 24,
          gracePeriodHours: 12,
          warningThresholdHours: 20,
        }
      });
    }

    response.success(res, {
      rules: {
        maxInactivityGapHours: settings.maxInactivityGapHours,
        gracePeriodHours: settings.gracePeriodHours,
        warningThresholdHours: settings.warningThresholdHours,
        totalAllowedGap: settings.maxInactivityGapHours + settings.gracePeriodHours,
      },
    });
  } catch (error) {
    response.error(res, error.message, 500);
  }
};

module.exports = {
  getUserProfile,
  getActiveRepository,
  getUserRepositories,
  setActiveRepository,
  getRepositoryActivity,
  getWarningsAndViolations,
  getDashboardSummary,
  getAdminRules,
};
