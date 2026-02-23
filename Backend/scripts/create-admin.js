/**
 * Create/Promote Admin Script (MongoDB)
 * Usage: node scripts/create-admin.js <user@example.com>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdmin(email) {
    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: node scripts/create-admin.js <user@example.com>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            console.log('You must sign up first before promoting to admin.');
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user._id})`);
        console.log(`Current Role: ${user.role}`);

        await User.findByIdAndUpdate(user._id, {
            role: 'ADMIN',
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Successfully promoted user to ADMIN.');
        console.log('You can now log in to the admin dashboard.');
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
}

const email = process.argv[2];
createAdmin(email);
