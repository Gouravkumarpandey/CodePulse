/**
 * Firestore Service
 * Handles Firestore database operations as an alternative/complement to MongoDB
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger.util');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../../users.json');
const REPOS_FILE = path.join(__dirname, '../../repositories.json');
const COMMITS_FILE = path.join(__dirname, '../../commits.json');
const ANALYSIS_FILE = path.join(__dirname, '../../repo_analysis.json');
const ADMIN_SETTINGS_FILE = path.join(__dirname, '../../admin_settings.json');
const HACKATHON_FILE = path.join(__dirname, '../../hackathon_status.json');

const getLocalUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    if (!data.trim()) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error('Error reading local users:', error.message);
    return [];
  }
};

const saveLocalUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving local users:', error);
    return false;
  }
};

const getLocalRepos = () => {
  try {
    if (!fs.existsSync(REPOS_FILE)) return [];
    const data = fs.readFileSync(REPOS_FILE, 'utf8');
    if (!data.trim()) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error('Error reading local repos:', error.message);
    return [];
  }
};

const saveLocalRepos = (repos) => {
  try {
    fs.writeFileSync(REPOS_FILE, JSON.stringify(repos, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving local repos:', error);
    return false;
  }
};

const getLocalCommits = () => {
  try {
    if (!fs.existsSync(COMMITS_FILE)) return [];
    const data = fs.readFileSync(COMMITS_FILE, 'utf8');
    if (!data.trim()) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error('Error reading local commits:', error.message);
    return [];
  }
};

const saveLocalCommits = (commits) => {
  try {
    // Keep only last 2000 commits globally to avoid huge files
    const limited = commits.slice(-2000);
    fs.writeFileSync(COMMITS_FILE, JSON.stringify(limited, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving local commits:', error);
    return false;
  }
};

const getLocalAnalysis = () => {
  try {
    if (!fs.existsSync(ANALYSIS_FILE)) return [];
    const data = fs.readFileSync(ANALYSIS_FILE, 'utf8');
    if (!data.trim()) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error('Error reading local analysis:', error.message);
    return [];
  }
};

const saveLocalAnalysis = (analysisList) => {
  try {
    fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(analysisList, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving local analysis:', error);
    return false;
  }
};

const getLocalAdminSettings = () => {
  try {
    if (!fs.existsSync(ADMIN_SETTINGS_FILE)) return null;
    const data = fs.readFileSync(ADMIN_SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('Error reading local admin settings:', error);
    return null;
  }
};

const saveLocalAdminSettings = (settings) => {
  try {
    fs.writeFileSync(ADMIN_SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving local admin settings:', error);
    return false;
  }
};

const getLocalHackathonStatus = () => {
  try {
    if (!fs.existsSync(HACKATHON_FILE)) return { isActive: false, startTime: null };
    const data = fs.readFileSync(HACKATHON_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('Error reading local hackathon status:', error);
    return { isActive: false, startTime: null };
  }
};

const saveLocalHackathonStatus = (status) => {
  try {
    fs.writeFileSync(HACKATHON_FILE, JSON.stringify(status, null, 2));
    return true;
  } catch (error) {
    logger.error('Error saving local hackathon status:', error);
    return false;
  }
};

class FirestoreService {
  /**
   * Save commit data to Firestore
   * @param {Object} commitData - Commit information
   * @returns {Promise<Object>} - Saved commit document
   */
  static async saveCommit(commitData) {
    try {
      const commitRef = db.collection('commits').doc(commitData.commitSha);
      await commitRef.set({
        ...commitData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info(`Commit saved to Firestore: ${commitData.commitSha}`);
      return { id: commitRef.id, ...commitData };
    } catch (error) {
      logger.error('Error saving commit to Firestore, checking local:', error.message);
      const commits = getLocalCommits();
      const existingIdx = commits.findIndex(c => c.commitSha === commitData.commitSha);
      const newCommit = {
        id: commitData.commitSha,
        ...commitData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        commits[existingIdx] = { ...commits[existingIdx], ...newCommit };
      } else {
        commits.push(newCommit);
      }

      saveLocalCommits(commits);
      return newCommit;
    }
  }

  /**
   * Get commits for a repository
   * @param {string} repoId - Repository ID
   * @param {number} limit - Maximum number of commits to fetch
   * @returns {Promise<Array>} - Array of commits
   */

  static async getCommitsByRepo(repoId, limit = 100) {
    try {
      // Without composite index, we can't sort by date on server.
      const fetchLimit = Math.max(limit, 500);

      const snapshot = await db
        .collection('commits')
        .where('repoId', '==', repoId)
        .limit(fetchLimit)
        .get();

      const commits = [];
      snapshot.forEach(doc => {
        commits.push({ id: doc.id, ...doc.data() });
      });

      // Sort in memory
      commits.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));

      return commits.slice(0, limit);
    } catch (error) {
      logger.error('Error fetching commits from Firestore, checking local:', error.message);
      const allCommits = getLocalCommits();
      const repoCommits = allCommits.filter(c => c.repoId === repoId);
      repoCommits.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));
      return repoCommits.slice(0, limit);
    }
  }

  /**
   * Get commit by SHA
   * @param {string} commitSha - Commit SHA
   * @returns {Promise<Object|null>} - Commit data
   */
  static async getCommitBySha(commitSha) {
    try {
      const doc = await db.collection('commits').doc(commitSha).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching commit from Firestore, checking local:', error.message);
      const allCommits = getLocalCommits();
      return allCommits.find(c => c.commitSha === commitSha) || null;
    }
  }

  /**
   * Save repository analysis to Firestore
   * @param {string} repoId - Repository ID
   * @param {Object} analysis - Analysis data
   * @returns {Promise<Object>} - Saved analysis
   */
  static async saveRepoAnalysis(repoId, analysis) {
    try {
      const analysisRef = db.collection('repoAnalysis').doc(repoId);
      await analysisRef.set({
        ...analysis,
        lastAnalyzedAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      logger.info(`Repository analysis saved to Firestore: ${repoId}`);
      return { id: analysisRef.id, ...analysis };
    } catch (error) {
      logger.error('Error saving analysis to Firestore, checking local:', error.message);
      const allAnalysis = getLocalAnalysis();
      const existingIdx = allAnalysis.findIndex(a => a.id === repoId);
      const newAnalysis = { id: repoId, ...analysis, updatedAt: new Date().toISOString() };

      if (existingIdx >= 0) {
        allAnalysis[existingIdx] = { ...allAnalysis[existingIdx], ...newAnalysis };
      } else {
        allAnalysis.push(newAnalysis);
      }

      saveLocalAnalysis(allAnalysis);
      return newAnalysis;
    }
  }

  /**
   * Get repository analysis from Firestore
   * @param {string} repoId - Repository ID
   * @returns {Promise<Object|null>} - Analysis data
   */
  static async getRepoAnalysis(repoId) {
    try {
      const doc = await db.collection('repoAnalysis').doc(repoId).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching analysis from Firestore, checking local:', error.message);
      const allAnalysis = getLocalAnalysis();
      return allAnalysis.find(a => a.id === repoId) || null;
    }
  }

  /**
   * Save user data to Firestore
   * @param {string} userId - User ID
   * @param {Object} userData - User information
   * @returns {Promise<Object>} - Saved user
   */
  static async saveUser(userId, userData) {
    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.set({
        ...userData,
        updatedAt: new Date(),
      }, { merge: true });

      return { id: userRef.id, ...userData };
    } catch (error) {
      logger.error('Error saving user to Firestore, falling back to local storage:', error.message);

      // Local Fallback
      const users = getLocalUsers();
      const existingIdx = users.findIndex(u => u.id === userId || u.email === userData.email);
      const newUser = { id: userId, ...userData, updatedAt: new Date().toISOString() };

      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...newUser };
      } else {
        users.push(newUser);
      }

      saveLocalUsers(users);
      return newUser;
    }
  }

  /**
   * Get user from Firestore
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User data
   */
  static async getUser(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();

      if (!doc.exists) {
        const localUsers = getLocalUsers();
        return localUsers.find(u => u.id === userId) || null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching user from Firestore, checking local:', error.message);
      const localUsers = getLocalUsers();
      return localUsers.find(u => u.id === userId) || null;
    }
  }

  /**
   * Delete user from Firestore
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async deleteUser(userId) {
    try {
      await db.collection('users').doc(userId).delete();
      logger.info(`User deleted from Firestore: ${userId}`);
    } catch (error) {
      logger.error('Error deleting user from Firestore:', error);
      throw error;
    }
  }

  /**
   * Update user in Firestore (partial update)
   * @param {string} userId - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} - Updated user data
   */
  static async updateUser(userId, updateData) {
    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        ...updateData,
        updatedAt: new Date(),
      });

      logger.info(`User updated in Firestore: ${userId}`);
      return { id: userId, ...updateData };
    } catch (error) {
      logger.error('Error updating user in Firestore, checking local:', error.message);
      const users = getLocalUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updateData, updatedAt: new Date().toISOString() };
        saveLocalUsers(users);
        return users[idx];
      }
      throw error;
    }
  }

  /**
   * Save repository metadata to Firestore
   * @param {string} repoId - Repository ID
   * @param {Object} repoData - Repository information
   * @returns {Promise<Object>} - Saved repository
   */
  static async saveRepository(repoId, repoData) {
    try {
      const repoRef = db.collection('repositories').doc(repoId);
      await repoRef.set({
        ...repoData,
        updatedAt: new Date(),
      }, { merge: true });

      return { id: repoRef.id, ...repoData };
    } catch (error) {
      logger.error('Error saving repository to Firestore, checking local:', error.message);
      const repos = getLocalRepos();
      const existingIdx = repos.findIndex(r => r.id === repoId);
      const newRepo = { id: repoId, ...repoData, updatedAt: new Date().toISOString() };

      if (existingIdx >= 0) {
        repos[existingIdx] = { ...repos[existingIdx], ...newRepo };
      } else {
        repos.push(newRepo);
      }

      saveLocalRepos(repos);
      return newRepo;
    }
  }

  /**
   * Delete repository from Firestore
   * @param {string} repoId - Repository ID
   * @returns {Promise<void>}
   */
  static async deleteRepository(repoId) {
    try {
      await db.collection('repositories').doc(repoId).delete();
      logger.info(`Repository deleted from Firestore: ${repoId}`);
    } catch (error) {
      logger.error('Error deleting repository from Firestore, checking local:', error.message);
      const repos = getLocalRepos();
      const filtered = repos.filter(r => r.id !== repoId);
      saveLocalRepos(filtered);
    }
  }

  /**
   * Get all repositories for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of repositories
   */
  static async getUserRepositories(userId) {
    try {
      console.log('Fetching repositories for user:', userId);
      const snapshot = await db
        .collection('repositories')
        .where('userId', '==', userId)
        .get();

      console.log('Snapshot size:', snapshot.size);
      const repos = [];
      snapshot.forEach(doc => {
        repos.push({ id: doc.id, ...doc.data() });
      });

      console.log('Found repositories:', repos.length);
      return repos;
    } catch (error) {
      logger.error('Error fetching repositories from Firestore, checking local:', error.message);
      const allRepos = getLocalRepos();
      return allRepos.filter(r => r.userId === userId);
    }
  }

  /**
   * Batch write operations
   * @param {Array} operations - Array of operations
   * @returns {Promise<void>}
   */
  static async batchWrite(operations) {
    try {
      const batch = db.batch();

      operations.forEach(op => {
        const ref = db.collection(op.collection).doc(op.docId);
        if (op.type === 'set') {
          batch.set(ref, op.data, { merge: true });
        } else if (op.type === 'update') {
          batch.update(ref, op.data);
        } else if (op.type === 'delete') {
          batch.delete(ref);
        }
      });

      await batch.commit();
      logger.info(`Batch operation completed: ${operations.length} operations`);
    } catch (error) {
      logger.error('Error in batch write, attempting local fallback:', error.message);

      // Basic local fallback for common collections
      for (const op of operations) {
        try {
          if (op.collection === 'repositories') {
            const repos = getLocalRepos();
            const idx = repos.findIndex(r => r.id === op.docId);
            if (op.type === 'set' || op.type === 'update') {
              if (idx >= 0) {
                repos[idx] = { ...repos[idx], ...op.data, updatedAt: new Date().toISOString() };
              } else if (op.type === 'set') {
                repos.push({ id: op.docId, ...op.data, updatedAt: new Date().toISOString() });
              }
              saveLocalRepos(repos);
            } else if (op.type === 'delete' && idx >= 0) {
              repos.splice(idx, 1);
              saveLocalRepos(repos);
            }
          } else if (op.collection === 'users') {
            const users = getLocalUsers();
            const idx = users.findIndex(u => u.id === op.docId);
            if (op.type === 'set' || op.type === 'update') {
              if (idx >= 0) {
                users[idx] = { ...users[idx], ...op.data, updatedAt: new Date().toISOString() };
              } else if (op.type === 'set') {
                users.push({ id: op.docId, ...op.data, updatedAt: new Date().toISOString() });
              }
              saveLocalUsers(users);
            } else if (op.type === 'delete' && idx >= 0) {
              users.splice(idx, 1);
              saveLocalUsers(users);
            }
          }
        } catch (localErr) {
          logger.error(`Local fallback failed for ${op.collection}:`, localErr.message);
        }
      }
    }
  }

  /**
   * Get commits by status
   * @param {Array} repoIds - Array of repository IDs
   * @param {string} status - Commit status (WARNING, VIOLATION, etc.)
   * @param {number} limit - Maximum number of commits to fetch
   * @returns {Promise<Array>} - Array of commits
   */
  static async getCommitsByStatus(repoIds, status, limit = 50) {
    try {
      const snapshot = await db
        .collection('commits')
        .where('repoId', 'in', repoIds)
        .where('status', '==', status)
        // .orderBy('commitDate', 'desc') // Removed to avoid index error
        .limit(limit)
        .get();

      const commits = [];
      snapshot.forEach(doc => {
        commits.push({ id: doc.id, ...doc.data() });
      });

      // Sort in memory
      commits.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));

      return commits;
    } catch (error) {
      logger.error('Error fetching commits by status from Firestore, checking local:', error.message);
      const allCommits = getLocalCommits();
      const filtered = allCommits.filter(c => repoIds.includes(c.repoId) && c.status === status);
      filtered.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));
      return filtered.slice(0, limit);
    }
  }

  /**
   * Get repository by ID
   * @param {string} repoId - Repository ID
   * @returns {Promise<Object|null>} - Repository data
   */
  static async getRepository(repoId) {
    try {
      const doc = await db.collection('repositories').doc(repoId).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching repository from Firestore, checking local:', error.message);
      const allRepos = getLocalRepos();
      return allRepos.find(r => r.id === repoId) || null;
    }
  }

  /**
   * Get active repository for user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Active repository data
   */
  static async getActiveRepository(userId) {
    try {
      const snapshot = await db
        .collection('repositories')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching active repository from Firestore, checking local:', error.message);
      const allRepos = getLocalRepos();
      return allRepos.find(r => r.userId === userId && r.isActive) || null;
    }
  }

  /**
   * Get admin settings
   * @returns {Promise<Object|null>} - Admin settings
   */
  static async getAdminSettings() {
    try {
      const snapshot = await db.collection('adminSettings').limit(1).get();

      if (snapshot.empty) {
        return getLocalAdminSettings();
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching admin settings from Firestore, checking local:', error.message);
      return getLocalAdminSettings();
    }
  }

  /**
   * Save admin settings
   * @param {Object} settings - Admin settings
   * @returns {Promise<Object>} - Saved settings
   */
  static async saveAdminSettings(settings) {
    try {
      const snapshot = await db.collection('adminSettings').limit(1).get();
      let settingsRef;

      if (snapshot.empty) {
        settingsRef = db.collection('adminSettings').doc();
      } else {
        settingsRef = snapshot.docs[0].ref;
      }

      await settingsRef.set({
        ...settings,
        updatedAt: new Date(),
      }, { merge: true });

      logger.info('Admin settings saved to Firestore');
      return { id: settingsRef.id, ...settings };
    } catch (error) {
      logger.error('Error saving admin settings to Firestore, checking local:', error.message);
      saveLocalAdminSettings(settings);
      return settings;
    }
  }
  /**
   * Get user by Email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User data
   */
  static async getUserByEmail(email) {
    try {
      const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
      if (snapshot.empty) {
        // Even if empty in Firestore, check local if Firestore didn't error but query returned nothing
        const localUsers = getLocalUsers();
        return localUsers.find(u => u.email === email) || null;
      };
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching user by email from Firestore, checking local:', error.message);
      const localUsers = getLocalUsers();
      return localUsers.find(u => u.email === email) || null;
    }
  }

  /**
   * Get user by GitHub ID
   * @param {string} githubId - GitHub User ID
   * @returns {Promise<Object|null>} - User data
   */
  static async getUserByGithubId(githubId) {
    try {
      // Ensure githubId is treated consistently (string/number)
      const snapshot = await db.collection('users').where('githubId', '==', githubId.toString()).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching user by GitHub ID from Firestore, checking local:', error.message);
      const allUsers = getLocalUsers();
      return allUsers.find(u => u.githubId === githubId.toString()) || null;
    }
  }

  /**
   * Add coins to user balance (Atomic increment)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   */
  static async addCoins(userId, amount) {
    try {
      const userRef = db.collection('users').doc(userId);
      const admin = require('firebase-admin');
      await userRef.update({
        coins: admin.firestore.FieldValue.increment(amount)
      });
      logger.info(`Added ${amount} coins to user ${userId}`);
    } catch (error) {
      logger.error('Error adding coins:', error);
      // Fallback for missing field or document
      if (error.code === 5) { // NOT_FOUND
        // Handle gracefully if needed
      }
      throw error;
    }
  }

  /**
   * Record a coin transaction
   * @param {Object} transaction - Transaction data
   */
  static async addCoinTransaction(transaction) {
    try {
      await db.collection('coin_transactions').add({
        ...transaction,
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Error adding coin transaction:', error);
      // Non-blocking error usually
    }
  }
  /**
   * Get all users
   * @returns {Promise<Array>} - Array of all users
   */
  static async getAllUsers() {
    try {
      const snapshot = await db.collection('users').get();
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      logger.error('Error fetching all users from Firestore, checking local:', error);
      return getLocalUsers();
    }
  }

  /**
   * Get user by GitHub access token
   * @param {string} token - GitHub access token
   * @returns {Promise<Object|null>} - User data
   */
  static async getUserByGithubAccessToken(token) {
    try {
      const snapshot = await db.collection('users').where('githubAccessToken', '==', token).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching user by GitHub token from Firestore, checking local:', error.message);
      const allUsers = getLocalUsers();
      return allUsers.find(u => u.githubAccessToken === token) || null;
    }
  }

  /**
   * Get global recent activity (commits)
   * @param {number} limit - Max number of activities
   * @returns {Promise<Array>} - Array of commits
   */
  static async getGlobalRecentActivity(limit = 20) {
    try {
      // Note: This requires a composite index on commitDate DESC.
      // If index is missing, we might need to fetch more and sort in memory, similar to other methods.
      // For now, attempting direct query. If it fails, we fall back to in-memory sort.
      let snapshot;
      try {
        snapshot = await db.collection('commits')
          .orderBy('commitDate', 'desc')
          .limit(limit)
          .get();
      } catch (indexError) {
        if (indexError.code === 5 || indexError.message.includes('index')) {
          // Fallback: Fetch latest 500 and sort
          snapshot = await db.collection('commits').limit(500).get();
        } else {
          throw indexError;
        }
      }

      const activities = [];
      snapshot.forEach(doc => {
        activities.push({ id: doc.id, ...doc.data() });
      });

      // Ensure sorted if fallback was used
      activities.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));

      return activities.slice(0, limit);
    } catch (error) {
      logger.error('Error fetching global activity from Firestore, checking local:', error);
      const allCommits = getLocalCommits();
      allCommits.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));
      return allCommits.slice(0, limit);
    }
  }

  /**
   * Get global violations
   * @param {number} limit - Max number of violations
   * @returns {Promise<Array>} - Array of violation commits
   */
  static async getGlobalViolations(limit = 20) {
    try {
      const snapshot = await db.collection('commits')
        .where('status', 'in', ['VIOLATION', 'WARNING'])
        // .orderBy('commitDate', 'desc') // Avoid index issues
        .limit(100) // Increase fetch to sort in memory
        .get();

      const violations = [];
      snapshot.forEach(doc => {
        violations.push({ id: doc.id, ...doc.data() });
      });

      violations.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));
      return violations.slice(0, limit);
    } catch (error) {
      logger.error('Error fetching global violations from Firestore, checking local:', error);
      const allCommits = getLocalCommits();
      const filtered = allCommits.filter(c => ['VIOLATION', 'WARNING'].includes(c.status));
      filtered.sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate));
      return filtered.slice(0, limit);
    }
  }

  /**
   * Start a global Hackathon
   * @returns {Promise<Object>} - Updated settings
   */
  static async startHackathon() {
    try {
      const settingsRef = db.collection('settings').doc('hackathon');
      const startTime = new Date().toISOString();
      await settingsRef.set({
        isActive: true,
        startTime: startTime,
        endTime: null,
        updatedAt: startTime
      }, { merge: true });
      return { isActive: true, startTime };
    } catch (error) {
      logger.error('Error starting hackathon:', error);
      throw error;
    }
  }

  /**
   * End the global Hackathon
   * @returns {Promise<Object>} - Updated settings
   */
  static async endHackathon() {
    try {
      const settingsRef = db.collection('settings').doc('hackathon');
      const endTime = new Date().toISOString();
      await settingsRef.update({
        isActive: false,
        endTime: endTime,
        updatedAt: endTime
      });
      return { isActive: false, endTime };
    } catch (error) {
      logger.error('Error ending hackathon:', error);
      throw error;
    }
  }

  /**
   * Get current Hackathon status
   * @returns {Promise<Object>} - Status object
   */
  static async getHackathonStatus() {
    try {
      const doc = await db.collection('settings').doc('hackathon').get();
      if (!doc.exists) return { isActive: false, startTime: null };
      return doc.data();
    } catch (error) {
      logger.error('Error fetching hackathon status:', error);
      return { isActive: false, startTime: null };
    }
  }
}

module.exports = FirestoreService;
