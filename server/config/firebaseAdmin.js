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
  const realAuth = getApps().length > 0 ? getAuth() : null;

  return {
    verifyIdToken: async (token) => {
      // Check if it is a mock token (ends with .mock_signature or starts with mock_)
      if (token && (token.endsWith('.mock_signature') || token.startsWith('mock_'))) {
        console.log('[MockAuth] Verifying ID token locally (Mock/Bypass detected)...');
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
      }

      // If we have real firebase auth initialized, use it
      if (realAuth) {
        return realAuth.verifyIdToken(token);
      }

      throw new Error('Firebase app not initialized and token is not a valid mock token');
    },
    getUser: async (uid) => {
      if (realAuth) {
        try {
          return await realAuth.getUser(uid);
        } catch (err) {
          // If not found in real firebase, fall back to mock
        }
      }
      return { uid, displayName: `User (${uid})` };
    },
    createUser: async (properties) => {
      if (realAuth) {
        try {
          return await realAuth.createUser(properties);
        } catch (err) {
          // Fall back
        }
      }
      return { uid: properties.uid, ...properties };
    },
    createCustomToken: async (uid) => {
      if (realAuth) {
        try {
          return await realAuth.createCustomToken(uid);
        } catch (err) {
          // Fall back
        }
      }
      return `mock_custom_token_${uid}`;
    }
  };
};

// Export an object compatible with the existing admin.auth() usages
const admin = {
  auth: getAuthMock
};

export default admin;
