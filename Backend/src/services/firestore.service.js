/**
 * Firestore Service
 * Handles Firestore database operations as an alternative/complement to MongoDB
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger.util');

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
      logger.error('Error saving commit to Firestore:', error);
      throw error;
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
      // We fetch more documents (up to 500) to increase chance of getting recent ones,
      // then sort in memory and slice to requested limit.
      const fetchLimit = Math.max(limit, 500);

      const snapshot = await db
        .collection('commits')
        .where('repoId', '==', repoId)
        // .orderBy('commitDate', 'desc') // Removed to avoid index error
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
      logger.error('Error fetching commits from Firestore:', error);
      throw error;
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
      logger.error('Error fetching commit from Firestore:', error);
      throw error;
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
      logger.error('Error saving analysis to Firestore:', error);
      throw error;
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
      logger.error('Error fetching analysis from Firestore:', error);
      throw error;
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
      logger.error('Error saving user to Firestore:', error);
      throw error;
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
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching user from Firestore:', error);
      throw error;
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
      logger.error('Error updating user in Firestore:', error);
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
      logger.error('Error saving repository to Firestore:', error);
      throw error;
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
      logger.error('Error deleting repository from Firestore:', error);
      throw error;
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
      logger.error('Error fetching repositories from Firestore:', error);
      console.error('Detailed error:', error.message, error.stack);
      throw error;
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
      logger.error('Error in batch write:', error);
      throw error;
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
      logger.error('Error fetching commits by status from Firestore:', error);
      throw error;
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
      logger.error('Error fetching repository from Firestore:', error);
      throw error;
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
      logger.error('Error fetching active repository from Firestore:', error);
      throw error;
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
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching admin settings from Firestore:', error);
      throw error;
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
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw error;
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
      logger.error('Error fetching user by GitHub ID:', error);
      throw error;
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
      logger.error('Error fetching all users:', error);
      throw error;
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
      logger.error('Error fetching user by GitHub token:', error);
      throw error;
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
      logger.error('Error fetching global activity:', error);
      throw error;
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
      logger.error('Error fetching global violations:', error);
      throw error;
    }
  }
}

module.exports = FirestoreService;
