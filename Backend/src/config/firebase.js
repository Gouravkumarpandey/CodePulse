/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for Firestore database access
 *
 * In production (Render), credentials are loaded from environment variables.
 * In local development, falls back to firebase-credentials.json.
 */

const admin = require('firebase-admin');

let serviceAccount;

// Production: credentials stored as env vars on Render dashboard
if (process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: 'googleapis.com',
  };
} else {
  // Local development: load from JSON file (gitignored)
  try {
    serviceAccount = require('./firebase-credentials.json');
  } catch (e) {
    console.warn('⚠️ Firebase credentials not found. Falling back to local JSON storage for all operations.');
    // Don't exit, let the app run with local fallbacks
    serviceAccount = null;
  }
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'codepulse-483719',
      });
    } else {
      console.warn('⚠️ Firebase Admin not initialized (no credentials).');
    }
  } catch (initError) {
    console.error('❌ Failed to initialize Firebase Admin:', initError.message);
  }
}

// Create a safe db object
let db;
try {
  if (admin.apps.length) {
    db = admin.firestore();
  } else {
    // Return a proxy that throws on every access to trigger catches in service
    db = new Proxy({}, {
      get: () => {
        throw new Error('Firestore not initialized');
      }
    });
  }
} catch (e) {
  db = new Proxy({}, {
    get: () => {
      throw new Error('Firestore not initialized');
    }
  });
}

// Export both admin and db
module.exports = {
  admin,
  db,
  firestore: admin.firestore,
};
