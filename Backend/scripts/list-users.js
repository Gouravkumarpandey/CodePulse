const { db } = require('../src/config/firebase');

async function listUsers() {
    try {
        console.log('Fetching all users...');
        const snapshot = await db.collection('users').get();

        if (snapshot.empty) {
            console.log('No users found in the database.');
            return;
        }

        console.log('\n--- User List ---');
        snapshot.forEach(doc => {
            const user = doc.data();
            console.log(`Email: ${user.email} | Password: ${user.password} | Role: ${user.role} | ID: ${doc.id}`);
        });
        console.log('-----------------\n');
        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
}

listUsers();
