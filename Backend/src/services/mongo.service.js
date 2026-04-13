/**
 * MongoDB Service
 * Implementation of data operations using Mongoose models
 */

const User = require('../models/User');
const Repo = require('../models/Repo');
const Commit = require('../models/Commit');
const RepoAnalysis = require('../models/RepoAnalysis');
const AdminSettings = require('../models/AdminSettings');
const CoinTransaction = require('../models/CoinTransaction');
const logger = require('../utils/logger.util');
const mongoose = require('mongoose');

class MongoDBService {
    /**
     * User Operations
     */
    static async getUserByEmail(email) {
        try {
            return await User.findOne({ email, isDeleted: false });
        } catch (error) {
            logger.error('Error fetching user by email:', error.message);
            throw error;
        }
    }

    static async getUser(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                // Fallback for cases where we might still have string IDs from Firestore logic
                return await User.findOne({
                    $or: [{ _id: userId }, { id: userId }]
                });
            }
            return await User.findById(userId);
        } catch (error) {
            logger.error('Error fetching user:', error.message);
            throw error;
        }
    }

    static async saveUser(userId, userData) {
        try {
            // If userId is provided and is a valid ObjectId, we update
            // Otherwise we might be creating a new user or updating by string ID
            let user;
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                user = await User.findByIdAndUpdate(userId, userData, { returnDocument: 'after', upsert: true });
            } else {
                // If it's a legacy hex ID from Firestore script, we might need to handle it
                user = await User.findOneAndUpdate({ email: userData.email }, userData, { returnDocument: 'after', upsert: true });
            }
            return user;
        } catch (error) {
            logger.error('Error saving user:', error.message);
            throw error;
        }
    }

    static async updateUser(userId, updateData) {
        try {
            return await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });
        } catch (error) {
            logger.error('Error updating user:', error.message);
            throw error;
        }
    }

    static async getUserByGithubId(githubId) {
        try {
            return await User.findOne({ githubId: String(githubId) });
        } catch (error) {
            logger.error('Error fetching user by GitHub ID:', error.message);
            throw error;
        }
    }

    static async getUserByGithubAccessToken(token) {
        try {
            return await User.findOne({ githubAccessToken: token });
        } catch (error) {
            logger.error('Error fetching user by GitHub token:', error.message);
            throw error;
        }
    }

    static async getUserByClerkId(clerkId) {
        try {
            return await User.findOne({ clerkId });
        } catch (error) {
            logger.error('Error fetching user by Clerk ID:', error.message);
            throw error;
        }
    }

    static async getAllUsers() {
        try {
            return await User.find({ isDeleted: false }).sort({ createdAt: -1 });
        } catch (error) {
            logger.error('Error fetching all users:', error.message);
            throw error;
        }
    }

    /**
     * Repository Operations
     */
    static async saveRepository(repoId, repoData) {
        try {
            if (repoId && mongoose.Types.ObjectId.isValid(repoId)) {
                return await Repo.findByIdAndUpdate(repoId, repoData, { new: true, upsert: true });
            }
            // If no valid ObjectId repoId, use githubRepoId as unique key
            return await Repo.findOneAndUpdate(
                { githubRepoId: repoData.githubRepoId },
                repoData,
                { new: true, upsert: true }
            );
        } catch (error) {
            logger.error('Error saving repository:', error.message);
            throw error;
        }
    }

    static async getRepository(repoId) {
        try {
            return await Repo.findById(repoId);
        } catch (error) {
            logger.error('Error fetching repository:', error.message);
            throw error;
        }
    }

    static async getUserRepositories(userId) {
        try {
            return await Repo.find({ userId, isConnected: true }).sort({ updatedAt: -1 });
        } catch (error) {
            logger.error('Error fetching user repositories:', error.message);
            throw error;
        }
    }

    static async getActiveRepository(userId) {
        try {
            return await Repo.findOne({ userId, isActive: true });
        } catch (error) {
            logger.error('Error fetching active repository:', error.message);
            throw error;
        }
    }

    static async deleteRepository(repoId) {
        try {
            // Delete related items
            await Commit.deleteMany({ repoId });
            await RepoAnalysis.deleteOne({ repoId });
            
            return await Repo.findByIdAndDelete(repoId);
        } catch (error) {
            logger.error('Error deleting repository:', error.message);
            throw error;
        }
    }

    /**
     * Commit Operations
     */
    static async saveCommit(commitData) {
        try {
            return await Commit.findOneAndUpdate(
                { commitSha: commitData.commitSha },
                commitData,
                { new: true, upsert: true }
            );
        } catch (error) {
            logger.error('Error saving commit:', error.message);
            throw error;
        }
    }

    static async getCommitsByRepo(repoId, limit = 100) {
        try {
            return await Commit.find({ repoId })
                .sort({ commitDate: -1 })
                .limit(limit);
        } catch (error) {
            logger.error('Error fetching commits by repo:', error.message);
            throw error;
        }
    }

    static async getCommitBySha(commitSha) {
        try {
            return await Commit.findOne({ commitSha });
        } catch (error) {
            logger.error('Error fetching commit by SHA:', error.message);
            throw error;
        }
    }

    static async getCommitsByStatus(repoIds, status, limit = 50) {
        try {
            return await Commit.find({
                repoId: { $in: repoIds },
                status: status
            })
                .sort({ commitDate: -1 })
                .limit(limit);
        } catch (error) {
            logger.error('Error fetching commits by status:', error.message);
            throw error;
        }
    }

    static async getGlobalRecentActivity(limit = 20) {
        try {
            return await Commit.find({})
                .sort({ commitDate: -1 })
                .limit(limit)
                .populate('userId', 'username avatar avatarId');
        } catch (error) {
            logger.error('Error fetching global activity:', error.message);
            throw error;
        }
    }

    static async getGlobalViolations(limit = 20) {
        try {
            return await Commit.find({ status: 'VIOLATION' })
                .sort({ commitDate: -1 })
                .limit(limit)
                .populate('userId', 'username avatar avatarId');
        } catch (error) {
            logger.error('Error fetching global violations:', error.message);
            throw error;
        }
    }

    /**
     * Analysis Operations
     */
    static async saveRepoAnalysis(repoId, analysis) {
        try {
            return await RepoAnalysis.findOneAndUpdate(
                { repoId },
                { ...analysis, repoId },
                { new: true, upsert: true }
            );
        } catch (error) {
            logger.error('Error saving repository analysis:', error.message);
            throw error;
        }
    }

    static async getRepoAnalysis(repoId) {
        try {
            return await RepoAnalysis.findOne({ repoId });
        } catch (error) {
            logger.error('Error fetching repository analysis:', error.message);
            throw error;
        }
    }

    /**
     * Coin Operations
     */
    static async addCoins(userId, amount) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $inc: { coins: amount } },
                { new: true }
            );
        } catch (error) {
            logger.error('Error adding coins:', error.message);
            throw error;
        }
    }

    static async addCoinTransaction(transaction) {
        try {
            const tx = new CoinTransaction(transaction);
            return await tx.save();
        } catch (error) {
            logger.error('Error adding coin transaction:', error.message);
            throw error;
        }
    }

    /**
     * Admin Settings & Hackathon
     */
    static async getAdminSettings() {
        try {
            let settings = await AdminSettings.findOne().sort({ createdAt: -1 });
            if (!settings) {
                // Create default settings if none exist
                settings = new AdminSettings();
                await settings.save();
            }
            return settings;
        } catch (error) {
            logger.error('Error fetching admin settings:', error.message);
            throw error;
        }
    }

    static async saveAdminSettings(settingsData) {
        try {
            return await AdminSettings.findOneAndUpdate(
                {},
                settingsData,
                { new: true, upsert: true, sort: { createdAt: -1 } }
            );
        } catch (error) {
            logger.error('Error saving admin settings:', error.message);
            throw error;
        }
    }

    static async getHackathonStatus() {
        // This could also be in AdminSettings or a separate collection
        // For simplicity, let's assume it's in a single-doc collection 'Hackathon'
        try {
            const settings = await this.getAdminSettings();
            // Assuming AdminSettings has hackathon fields
            return {
                isActive: settings.isHackathonActive || false,
                startTime: settings.hackathonStartTime || null,
                totalDuration: settings.totalHackathonDurationHours || 48
            };
        } catch (error) {
            logger.error('Error fetching hackathon status:', error.message);
            return { isActive: false, startTime: null };
        }
    }

    /**
     * Utility
     */
    static async batchWrite(operations) {
        try {
            // Direct implementation for common cases if needed
            // MongoDB uses bulkWrite for this
            const bulkOps = operations.map(op => {
                const Model = this._getModelForCollection(op.collection);
                if (op.type === 'set' || op.type === 'update') {
                    return {
                        updateOne: {
                            filter: { _id: op.docId },
                            update: { $set: op.data },
                            upsert: op.type === 'set'
                        }
                    };
                } else if (op.type === 'delete') {
                    return {
                        deleteOne: {
                            filter: { _id: op.docId }
                        }
                    };
                }
            }).filter(Boolean);

            // This is a bit complex since operations might be across different collections.
            // For now, let's just group by collection and run bulkWrite.
            const groupedOps = {};
            operations.forEach(op => {
                if (!groupedOps[op.collection]) groupedOps[op.collection] = [];
                groupedOps[op.collection].push(op);
            });

            for (const [collection, ops] of Object.entries(groupedOps)) {
                const Model = this._getModelForCollection(collection);
                if (Model) {
                    const bOps = ops.map(o => {
                        if (o.type === 'set' || o.type === 'update') {
                            return { updateOne: { filter: { _id: o.docId }, update: { $set: o.data }, upsert: o.type === 'set' } };
                        } else if (o.type === 'delete') {
                            return { deleteOne: { filter: { _id: o.docId } } };
                        }
                    });
                    await Model.bulkWrite(bOps);
                }
            }
        } catch (error) {
            logger.error('Error in batch write:', error.message);
            throw error;
        }
    }

    static _getModelForCollection(collection) {
        switch (collection) {
            case 'users': return User;
            case 'repositories': return Repo;
            case 'commits': return Commit;
            case 'repoAnalysis': return RepoAnalysis;
            case 'adminSettings': return AdminSettings;
            case 'coinTransactions': return CoinTransaction;
            default: return null;
        }
    }
}

module.exports = MongoDBService;
