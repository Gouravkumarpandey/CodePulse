const fs = require('fs');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const logFile = 'test_results.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function test() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log('--- Testing User Flow ---');
    try {
        // 1. Signup
        log('1. Signup...');
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            email: 'testuser@example.com',
            password: 'password123',
            username: 'testuser'
        }).catch(err => err.response);

        if (signupRes && (signupRes.status === 201 || signupRes.status === 400)) {
            log(`Signup Result: ${signupRes.status} ${JSON.stringify(signupRes.data)}`);
        } else {
            log(`Signup Failed: ${signupRes.status} ${JSON.stringify(signupRes.data)}`);
        }

        // 2. Login
        log('2. Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        }).catch(err => err.response);

        if (loginRes && loginRes.status === 200) {
            log('Login Success! Token obtained.');
            const token = loginRes.data.data.token;

            // 3. Get Profile
            log('3. Fetching profile...');
            const profileRes = await axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => err.response);

            log(`Profile Result: ${profileRes.status} ${JSON.stringify(profileRes.data)}`);
        } else {
            log(`Login Failed: ${loginRes ? loginRes.status : 'No response'} ${JSON.stringify(loginRes ? loginRes.data : 'Error')}`);
        }

        // 4. Health Check
        log('4. Health Check...');
        const healthRes = await axios.get(`${API_URL}/health`);
        log(`Health: ${JSON.stringify(healthRes.data)}`);

    } catch (error) {
        log(`Unexpected Error: ${error.message}`);
    }
}

test();
