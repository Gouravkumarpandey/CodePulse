const { db } = require('../src/config/firebase');

async function setAdminPassword() {
    try {
        console.log('Setting password for admin@codepulse.com...');

        let userRef;
        const snapshot = await db.collection('users').where('email', '==', 'admin@codepulse.com').get();

        if (snapshot.empty) {
            console.log('User admin@codepulse.com not found. Creating it...');
            const crypto = require('crypto');
            const userId = crypto.randomUUID();
            userRef = db.collection('users').doc(userId);
            await userRef.set({
                id: userId,
                email: 'admin@codepulse.com',
                password: 'admin123',
                role: 'ADMIN',
                username: 'Admin',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } else {
            console.log('User found. Updating password...');
            const doc = snapshot.docs[0];
            userRef = doc.ref;
            await userRef.update({
                password: 'admin123',
                role: 'ADMIN' // Ensure role is ADMIN
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
