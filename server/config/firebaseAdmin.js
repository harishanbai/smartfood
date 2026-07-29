import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

try {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Missing Firebase Admin environment variables. Using Mock/Bypass mode for Auth verification.');
  } else {
    // Only initialize if not already initialized
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
      console.log('Firebase Admin initialized successfully');
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

const getAuthMock = () => {
  if (getApps().length === 0) {
    return {
      verifyIdToken: async (token) => {
        console.log('[MockAuth] Verifying ID token locally...');
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            return {
              uid: payload.user_id || payload.uid || payload.sub,
              email: payload.email,
              email_verified: payload.email_verified,
              name: payload.name,
              picture: payload.picture,
              phone_number: payload.phone_number
            };
          }
        } catch (decodeErr) {
          console.error('[MockAuth] Failed to decode token payload:', decodeErr.message);
        }
        throw new Error('Firebase app not initialized and token has an invalid format');
      },
      getUser: async (uid) => {
        return { uid, displayName: `WhatsApp User (${uid})` };
      },
      createUser: async (properties) => {
        return { uid: properties.uid, ...properties };
      },
      createCustomToken: async (uid) => {
        return `mock_custom_token_${uid}`;
      }
    };
  }
  return getAuth();
};

// Export an object compatible with the existing admin.auth() usages
const admin = {
  auth: getAuthMock
};

export default admin;
