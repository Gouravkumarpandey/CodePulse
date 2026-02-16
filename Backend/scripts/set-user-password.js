const { db } = require('../src/config/firebase');

async function setAdminPassword() {
    try {
        const email = 'pandeygourav2002@gmail.com';
        console.log(`Setting password for ${email}...`);

        const snapshot = await db.collection('users').where('email', '==', email).get();

        if (snapshot.empty) {
            console.log('User not found.');
        } else {
            const doc = snapshot.docs[0];
            await doc.ref.update({
                password: 'admin123'
            });
            console.log(`Password for ${email} set to: 'admin123'`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setAdminPassword();
