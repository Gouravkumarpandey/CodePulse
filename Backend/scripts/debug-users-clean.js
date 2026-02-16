const { db } = require('../src/config/firebase');

async function listUsers() {
    const snapshot = await db.collection('users').get();
    snapshot.forEach(doc => {
        const d = doc.data();
        console.log('--------------------------------------------------');
        console.log(`Email: ${d.email}`);
        console.log(`Password: ${d.password}`);
        console.log(`Role: ${d.role}`);
        console.log('--------------------------------------------------');
    });
}
listUsers();
