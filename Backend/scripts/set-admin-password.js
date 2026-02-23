/**
 * Set Admin Password Script (MongoDB)
 * Usage: node scripts/set-admin-password.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function setAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Setting password for admin@codepulse.com...');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const email = 'admin@codepulse.com';

        let user = await User.findOne({ email });

        if (!user) {
            console.log('User admin@codepulse.com not found. Creating it...');
            user = new User({
                email,
                password: hashedPassword,
                role: 'ADMIN',
                username: 'Admin',
                isActive: true,
            });
            await user.save();
        } else {
            console.log('User found. Updating password...');
            await User.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                role: 'ADMIN',
            });
        }

        console.log('Password set to: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setAdminPassword();
