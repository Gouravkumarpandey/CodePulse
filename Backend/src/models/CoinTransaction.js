const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['REWARD', 'PENALTY', 'SPEND'],
        default: 'REWARD',
    },
    source: {
        type: String, // e.g., 'COMMIT', 'STREAK', 'SHOP'
        required: true,
    },
    referenceId: String, // e.g., commit SHA
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

coinTransactionSchema.index({ userId: 1, referenceId: 1 }, { unique: true, partialFilterExpression: { referenceId: { $exists: true } } });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
