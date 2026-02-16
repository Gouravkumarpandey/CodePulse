const { db } = require('../src/config/firebase');

async function setAdminCredentials(email, password) {
    if (!email || !password) {
        console.error('Usage: node scripts/set-admin-credentials.js <email> <password>');
        process.exit(1);
    }

    try {
        console.log(`Searching for user with email: ${email}...`);
        const usersSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (usersSnapshot.empty) {
            console.log(`User not found. Creating new ADMIN user...`);
            // Create new admin user
            const userData = {
                email,
                password,
                username: email.split('@')[0],
                role: 'ADMIN',
                coins: 9999,
                avatarId: 1, // Default Minecraft
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await db.collection('users').add(userData);
            console.log(`✅ Created new ADMIN user: ${email} with password: ${password}`);
        } else {
            const userDoc = usersSnapshot.docs[0];
            console.log(`Found user: ${userDoc.data().email}. Updating credentials...`);

            await userDoc.ref.update({
                password: password,
                role: 'ADMIN',
                isActive: true,
                updatedAt: new Date().toISOString()
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
