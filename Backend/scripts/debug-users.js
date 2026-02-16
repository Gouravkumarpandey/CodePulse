const { db } = require('../src/config/firebase');

async function listUsers() {
    try {
        console.log('Fetching all users...');
        const snapshot = await db.collection('users').get();

        if (snapshot.empty) {
            console.log('No users found.');
            return;
        }

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            users.push({
                id: doc.id,
                email: data.email,
                password: data.password || '[NO PASSWORD]',
                role: data.role,
                isActive: data.isActive
            });
        });

        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
