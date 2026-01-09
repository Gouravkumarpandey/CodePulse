/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for Firestore database access
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('./firebase-credentials.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'codepulse-483719',
  });
}

const db = admin.firestore();

// Export both admin and db
module.exports = {
  admin,
  db,
  firestore: admin.firestore,
};
