/**
 * Set User Password Script (MongoDB)
 * Usage: node scripts/set-user-password.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function setUserPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'pandeygourav2002@gmail.com';
        console.log(`Setting password for ${email}...`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found.');
        } else {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.findByIdAndUpdate(user._id, { password: hashedPassword });
            console.log(`Password for ${email} set to: 'admin123'`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setUserPassword();
