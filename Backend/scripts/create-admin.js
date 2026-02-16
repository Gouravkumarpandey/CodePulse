const { db, admin } = require('../src/config/firebase');

async function createAdmin(email) {
    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: node scripts/create-admin.js <user@example.com>');
        process.exit(1);
    }

    try {
        console.log(`Searching for user with email: ${email}...`);
        const usersSnapshot = await db.collection('users').where('email', '==', email).get();

        if (usersSnapshot.empty) {
            console.error(`User with email ${email} not found.`);
            console.log('You must sign up first before promoting to admin.');
            process.exit(1);
        }

        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();

        console.log(`Found user: ${userData.username} (${userDoc.id})`);
        console.log(`Current Role: ${userData.role}`);

        await userDoc.ref.update({
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
