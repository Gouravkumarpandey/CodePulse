/**
 * Repository model
 * Stores connected repository information
 */

const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubRepoId: {
      type: Number,
      required: true,
    },
    name: String,
    fullName: String,
    owner: String,
    url: String,
    description: String,
    language: String,
    isPrivate: Boolean,
    // Only one repository can be active per user
    isActive: {
      type: Boolean,
      default: false,
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
    webhookId: String,
    lastCommitDate: Date,
    lastSync: Date,
    // Activity tracking
    totalCommits: {
      type: Number,
      default: 0,
    },
    currentInactivityGap: Number, // in hours
    maxInactivityGap: Number, // in hours
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure only one active repository per user
repoSchema.pre('save', async function(next) {
  if (this.isActive && this.isModified('isActive')) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('Repo', repoSchema);
