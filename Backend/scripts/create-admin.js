const FirestoreService = require('../src/services/firestore.service');

async function createAdmin(email) {
    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: node scripts/create-admin.js <user@example.com>');
        process.exit(1);
    }

    try {
        console.log(`Searching for user with email: ${email}...`);
        const user = await FirestoreService.getUserByEmail(email);

        if (!user) {
            console.error(`User with email ${email} not found.`);
            console.log('You must sign up first before promoting to admin.');
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user.id})`);
        console.log(`Current Role: ${user.role}`);

        await FirestoreService.updateUser(user.id, {
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
