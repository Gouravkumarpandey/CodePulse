const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function run() {
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const username = `testuser_${timestamp}`;
    const password = 'Password123!';

    console.log(`Trying signup with email: ${email}, username: ${username}`);

    try {
        const res = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password,
            username
        });
        console.log('Signup success:', res.status, res.data);
    } catch (err) {
        console.error('Signup Failed:', err.response ? err.response.status : 'No res', err.response ? err.response.data : err.message);
    }
}

run();
