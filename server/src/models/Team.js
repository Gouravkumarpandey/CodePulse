// Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: String }],
});

module.exports = mongoose.model('Team', TeamSchema);
