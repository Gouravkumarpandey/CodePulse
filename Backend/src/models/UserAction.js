/**
 * User Action model
 * Stores admin actions taken on users
 */

const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['WARNING', 'OBSERVATION', 'DISQUALIFICATION', 'REACTIVATION', 'NOTE'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    relatedCommitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commit',
    },
    metadata: {
      previousStatus: String,
      newStatus: String,
      violationDetails: Object,
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserAction', userActionSchema);
