require('dotenv').config();
const mongoose = require('mongoose');
const authController = require('./src/controllers/auth.controller');
const httpMocks = require('node-mocks-http');

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codepulse');
        console.log('DB Connected.');

        // 1. SIGNUP TEST
        const signupReq = httpMocks.createRequest({
            method: 'POST',
            url: '/api/auth/signup',
            body: {
                username: 'testuser_' + Math.floor(Math.random() * 1000),
                email: 'test' + Math.floor(Math.random() * 1000) + '@example.com',
                password: 'password123',
                role: 'USER'
            }
        });
        
        const signupRes = httpMocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });

        console.log('Testing SIGNUP with email:', signupReq.body.email);

        await authController.signup(signupReq, signupRes);

        const signupData = JSON.parse(signupRes._getData());
        console.log('\nSIGNUP Response Status:', signupRes.statusCode);
        console.log('SIGNUP Response Data:', JSON.stringify(signupData, null, 2));

        if (signupRes.statusCode === 201) {
             // 2. LOGIN TEST with exact same credentials
             const loginReq = httpMocks.createRequest({
                 method: 'POST',
                 url: '/api/auth/login',
                 body: {
                     email: signupReq.body.email,
                     password: 'password123'
                 }
             });

             const loginRes = httpMocks.createResponse();
             console.log('\nTesting LOGIN with email:', loginReq.body.email);

             await authController.login(loginReq, loginRes);

             const loginData = JSON.parse(loginRes._getData());
             console.log('LOGIN Response Status:', loginRes.statusCode);
             console.log('LOGIN Response Data:', JSON.stringify(loginData, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Test Execution error:', error);
    }
};

runTest();
