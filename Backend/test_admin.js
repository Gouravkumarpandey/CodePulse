
const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

const API_URL = 'http://localhost:5000/api';
const logFile = 'admin_test_results.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function testAdmin() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log('--- Testing Admin Flow ---');
    try {
        // 1. Signup Admin User
        log('1. Signing up admin user...');
        await axios.post(`${API_URL}/auth/signup`, {
            email: 'admin@example.com',
            password: 'admin123',
            username: 'admin'
        }).catch(err => {
            if (err.response && err.response.status === 400) {
                log('Admin user already exists.');
            } else {
                log('Signup error: ' + (err.response ? JSON.stringify(err.response.data) : err.message));
            }
        });

        // 2. Promote to ADMIN via script
        log('2. Promoting to ADMIN via script...');
        try {
            const output = execSync('node createAdmin.js admin@example.com').toString();
            log('Promotion Output: ' + output);
        } catch (e) {
            log('Promotion Error: ' + e.stderr.toString());
        }

        // 3. Login as Admin
        log('3. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        }).catch(err => err.response);

        if (loginRes && loginRes.status === 200) {
            const token = loginRes.data.data.token;
            const role = loginRes.data.data.user.role;
            log(`Login Success! Role: ${role}`);

            if (role !== 'ADMIN') {
                log('ERROR: Role is not ADMIN!');
            }

            // 4. Test Admin Endpoint (e.g., list users)
            log('4. Testing admin endpoint: list users...');
            const adminRes = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => err.response);

            if (adminRes && adminRes.status === 200) {
                log(`Admin Success! Found ${adminRes.data.data.length} users.`);
            } else {
                log(`Admin Endpoint Failed: ${adminRes ? adminRes.status : 'No response'} ${JSON.stringify(adminRes ? adminRes.data : 'Error')}`);
            }
        } else {
            log(`Admin Login Failed: ${loginRes ? loginRes.status : 'No response'} ${JSON.stringify(loginRes ? loginRes.data : 'Error')}`);
        }

    } catch (error) {
        log(`Unexpected Error: ${error.message}`);
    }
}

testAdmin();
