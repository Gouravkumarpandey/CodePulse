const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    inactivityAlert: { type: Boolean, default: true },
    burstCommitWarning: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String, // Can be null if using OAuth only
        },
        avatar: String, // URL or path
        avatarId: {
            type: Number,
            default: 1, // Default to first avatar
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
        githubId: String,
        githubAccessToken: String,
        googleId: String,

        // Coin System
        coins: {
            type: Number,
            default: 0,
        },

        // Settings
        settings: {
            type: userSettingsSchema,
            default: () => ({}),
        },

        // Account Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },

        // OTP for sensitive actions
        otp: String,
        otpExpires: Date,

        lastLogin: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
