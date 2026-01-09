/**
 * Admin Settings model
 * Stores global rules (max gap, grace period)
 */

const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema(
  {
    maxInactivityGapHours: {
      type: Number,
      default: 24,
      description: 'Maximum allowed gap between commits in hours',
    },
    gracePeriodHours: {
      type: Number,
      default: 12,
      description: 'Grace period before marking as violation',
    },
    warningThresholdHours: {
      type: Number,
      default: 20,
      description: 'Threshold to show warning (before violation)',
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
    notificationEmail: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
