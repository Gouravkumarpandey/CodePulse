/**
 * Set Admin Credentials Script (MongoDB)
 * Usage: node scripts/set-admin-credentials.js <email> <password>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function setAdminCredentials(email, password) {
    if (!email || !password) {
        console.error('Usage: node scripts/set-admin-credentials.js <email> <password>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Searching for user with email: ${email}...`);

        const hashedPassword = await bcrypt.hash(password, 10);
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User not found. Creating new ADMIN user...`);
            user = new User({
                email,
                password: hashedPassword,
                username: email.split('@')[0],
                role: 'ADMIN',
                coins: 9999,
                isActive: true,
            });
            await user.save();
            console.log(`✅ Created new ADMIN user: ${email}`);
        } else {
            console.log(`Found user: ${user.email}. Updating credentials...`);
            await User.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                role: 'ADMIN',
                isActive: true,
            });
            console.log(`✅ Updated existing user to ADMIN with new password.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error setting admin credentials:', error);
        process.exit(1);
    }
}

const email = process.argv[2];
const password = process.argv[3];
setAdminCredentials(email, password);
