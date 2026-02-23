/**
 * Debug Users Script (MongoDB)
 * Usage: node scripts/debug-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Fetching all users...');

        const users = await User.find({}).sort({ createdAt: -1 });

        if (users.length === 0) {
            console.log('No users found.');
            process.exit(0);
        }

        const output = users.map(u => ({
            id: u._id,
            email: u.email,
            role: u.role,
            isActive: u.isActive
        }));

        console.log(JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
