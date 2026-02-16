const { db } = require('../src/config/firebase');

async function listUsers() {
    try {
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log('No users.');
            return;
        }

        snapshot.forEach(doc => {
            const d = doc.data();
            console.log(`User: ${d.email}, Pass: ${d.password}, Role: ${d.role}`);
        });
    } catch (error) {
        console.error(error);
    }
}
listUsers();
