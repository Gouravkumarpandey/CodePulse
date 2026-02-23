/**
 * Debug Users Simple Script (MongoDB)
 * Usage: node scripts/debug-users-simple.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const users = await User.find({});
        if (users.length === 0) {
            console.log('No users.');
            process.exit(0);
        }

        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listUsers();
