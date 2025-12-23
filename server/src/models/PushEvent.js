// PushEvent.js
const mongoose = require('mongoose');

const PushEventSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  timestamp: { type: Date, default: Date.now },
  commits: [{ type: Object }],
});

module.exports = mongoose.model('PushEvent', PushEventSchema);
