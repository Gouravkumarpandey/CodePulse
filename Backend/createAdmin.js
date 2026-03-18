const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.argv[2] || 'pandeygourav2002@gmail.com';
        const adminPassword = 'admin123';
        const adminUsername = process.argv[2] ? process.argv[2].split('@')[0] : 'Admin_Gourav';

        // Check if user exists
        let user = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminData = {
            email: adminEmail,
            password: hashedPassword,
            username: adminUsername,
            role: 'ADMIN',
            isActive: true,
            coins: 999999, // Admins get plenty of coins
            avatarId: 1
        };

        if (user) {
            console.log('Updating existing user to ADMIN...');
            await User.findByIdAndUpdate(user._id, adminData);
            console.log('Admin user updated successfully');
        } else {
            console.log('Creating new ADMIN user...');
            user = new User(adminData);
            await user.save();
            console.log('Admin user created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
