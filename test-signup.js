
const axios = require('axios');

async function testSignup() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/signup', {
            email: 'testuser@example.com',
            password: 'password123',
            username: 'testuser',
            role: 'USER'
        });
        console.log('Signup Success:', response.data);
    } catch (error) {
        console.error('Signup Error:', error.response ? error.response.data : error.message);
    }
}

testSignup();
