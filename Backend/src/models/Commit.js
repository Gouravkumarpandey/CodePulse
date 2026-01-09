/**
 * Commit model
 * Stores commit metadata and activity tracking
 */

const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repo',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commitSha: {
      type: String,
      required: true,
      unique: true,
    },
    message: String,
    author: String,
    committer: String,
    commitDate: Date,
    filesChanged: Number,
    additions: Number,
    deletions: Number,
    branch: String,
    status: {
      type: String,
      enum: ['OK', 'WARNING', 'VIOLATION'],
      default: 'OK',
    },
    inactivityGap: Number, // in hours
    isViolation: Boolean,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Commit', commitSchema);
