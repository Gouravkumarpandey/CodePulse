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
      const snapshot = await db
        .collection('commits')
        .where('repoId', '==', repoId)
        .orderBy('commitDate', 'desc')
        .limit(limit)
        .get();

      const commits = [];
      snapshot.forEach(doc => {
        commits.push({ id: doc.id, ...doc.data() });
      });

      return commits;
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
        .orderBy('commitDate', 'desc')
        .limit(limit)
        .get();

      const commits = [];
      snapshot.forEach(doc => {
        commits.push({ id: doc.id, ...doc.data() });
      });

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
}

module.exports = FirestoreService;
