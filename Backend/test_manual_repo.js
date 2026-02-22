
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testManualRepo() {
    console.log('Testing Manual Repo Flow...');
    try {
        // 1. Login to get token
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        const token = loginRes.data.data.token;
        console.log('Login Success.');

        // 2. Add manual repo
        const addRes = await axios.post(`${API_URL}/user/manual-repo`, {
            url: 'https://github.com/Gouravkumarpandey/CodePulse',
            accessToken: 'ghp_sampletoken123'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Add Manual Repo Result:', addRes.status, addRes.data.message);

        // 3. Verify it was added
        const listRes = await axios.get(`${API_URL}/user/repositories`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const repos = listRes.data.data.repositories;
        const added = repos.find(r => r.name === 'CodePulse');
        if (added) {
            console.log('Verification Success: Found manual repo in list.');
            console.log('Repo Details:', JSON.stringify(added));
        } else {
            console.error('Verification Failed: Manual repo not found.');
        }

    } catch (error) {
        console.error('Manual Repo Test Error:', error.response ? error.response.data : error.message);
    }
}

testManualRepo();
