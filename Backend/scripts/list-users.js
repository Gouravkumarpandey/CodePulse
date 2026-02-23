/**
 * List Users Script (MongoDB)
 * Usage: node scripts/list-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const users = await User.find({}).sort({ createdAt: -1 });

        if (users.length === 0) {
            console.log('No users found in the database.');
            process.exit(0);
        }

        console.log('\n--- User List ---');
        users.forEach(user => {
            console.log(`Email: ${user.email} | Role: ${user.role} | ID: ${user._id}`);
        });
        console.log('-----------------\n');
        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
}

listUsers();
