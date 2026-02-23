/**
 * Repository Analysis model
 * Stores AI-generated insights and consistency metrics for repositories
 */

const mongoose = require('mongoose');

const repoAnalysisSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repo',
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consistencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    consistencyGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
      default: 'F',
    },
    aiInsights: {
      type: String,
      default: '',
    },
    suggestions: [{
      type: String,
    }],
    statistics: {
      totalCommits: { type: Number, default: 0 },
      violations: { type: Number, default: 0 },
      warnings: { type: Number, default: 0 },
      averageGap: { type: Number, default: 0 },
      longestGap: { type: Number, default: 0 },
      burstCommits: { type: Number, default: 0 },
      lastMinuteCommits: { type: Number, default: 0 },
      timelineSpan: { type: Number, default: 0 },
    },
    distribution: {
      quarter1: { type: Number, default: 0 },
      quarter2: { type: Number, default: 0 },
      quarter3: { type: Number, default: 0 },
      quarter4: { type: Number, default: 0 },
    },
    lastAnalyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
// Note: repoId already has a unique index via `unique: true` in the field definition
repoAnalysisSchema.index({ userId: 1 });

module.exports = mongoose.model('RepoAnalysis', repoAnalysisSchema);
