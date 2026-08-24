import User from '../models/User.js';
import admin from '../config/firebaseAdmin.js';

/**
 * Middleware to verify Firebase Authorization token securely using Firebase Admin SDK.
 * Extracts Bearer token from header and resolves user from MongoDB.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Token missing.' });
    }

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Find the corresponding user in MongoDB
    let user = await User.findOne({ uid });

    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    // Attach user information to request
    // Pass both the found MongoDB user (if any) and the raw decoded token
    req.user = user || null;
    req.decodedToken = decodedToken;

    console.log('--- protect middleware ---');
    console.log('Token verified. UID:', uid);
    console.log('MongoDB user found:', !!user);

    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
};
