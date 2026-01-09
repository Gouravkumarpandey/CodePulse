/**
 * User & Admin model
 * Stores user and admin information
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // GitHub OAuth fields
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Firebase UID
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Email/Password authentication
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.githubId && !this.googleId; // Password required if not using OAuth
      },
    },
    username: {
      type: String,
      required: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    // GitHub access tokens (optional, only for OAuth users)
    accessToken: String,
    refreshToken: String,
    // User status
    status: {
      type: String,
      enum: ['ACTIVE', 'WARNING', 'VIOLATION', 'DISQUALIFIED'],
      default: 'ACTIVE',
    },
    // Tracking
    warningCount: {
      type: Number,
      default: 0,
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    isUnderObservation: {
      type: Boolean,
      default: false,
    },
    disqualifiedAt: Date,
    disqualificationReason: String,
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
