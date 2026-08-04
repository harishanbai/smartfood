import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID || 'smart-lunch-c8ac3';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

try {
  if (getApps().length === 0) {
    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
      console.log(`✅ Firebase Admin SDK initialized with Cert Credentials (Project ID: ${projectId})`);
    } else {
      initializeApp({
        projectId
      });
      console.log(`✅ Firebase Admin SDK initialized with Project ID (${projectId})`);
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

const admin = {
  auth: () => getAuth()
};

export default admin;
