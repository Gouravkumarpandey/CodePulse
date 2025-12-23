// Violation.js
const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  type: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Violation', ViolationSchema);
