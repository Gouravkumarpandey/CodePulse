/**
 * Debug Users Clean Script (MongoDB)
 * Usage: node scripts/debug-users-clean.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
    const users = await User.find({});
    users.forEach(u => {
        console.log('--------------------------------------------------');
        console.log(`Email: ${u.email}`);
        console.log(`Role:  ${u.role}`);
        console.log('--------------------------------------------------');
    });
}

mongoose.connect(process.env.MONGODB_URI).then(listUsers);
