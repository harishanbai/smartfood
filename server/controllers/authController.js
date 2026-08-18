import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import admin from '../config/firebaseAdmin.js';

/**
 * @desc    Register / Sync new user to MongoDB after Firebase Auth
 * @route   POST /api/auth/register
 * @access  Public / Protected
 */
export const registerUser = async (req, res) => {
  try {
    const { uid, name, displayName, email, phone, language, isVerified, photo } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'UID and Email are required.' });
    }

    const userName = (name || displayName || email.split('@')[0]).trim();

    const existingUser = await User.findOne({ $or: [{ uid }, { email: email.toLowerCase() }] });

    if (existingUser) {
      // Update existing record
      existingUser.uid = uid;
      existingUser.name = userName;
      existingUser.displayName = userName;
      if (phone) existingUser.phone = phone;
      if (language) existingUser.language = language;
      if (photo) existingUser.photo = photo;
      if (typeof isVerified === 'boolean') existingUser.isVerified = isVerified;
      existingUser.lastLogin = new Date();

      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: 'User profile updated successfully.',
        user: existingUser
      });
    }

    const newUser = await User.create({
      uid,
      name: userName,
      displayName: userName,
      email: email.toLowerCase(),
      photo: photo || '',
      phone: phone || '',
      language: language || 'en',
      role: 'user',
      isVerified: isVerified || false,
      lastLogin: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! User created in MongoDB.',
      user: newUser
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

/**
 * @desc    Login / Sync login state in MongoDB
 * @route   POST /api/auth/login
 * @access  Public / Protected
 */
export const loginUser = async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid && !email) {
      return res.status(400).json({ success: false, message: 'UID or Email required.' });
    }

    let user = await User.findOne(uid ? { uid } : { email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found in database.' });
    }

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * @desc    Google Sign-In backend sync
 * @route   POST /api/auth/google
 * @access  Public / Protected
 */
export const googleAuth = async (req, res) => {
  try {
    const { idToken, uid: bodyUid, displayName, name, email: bodyEmail, photo, photoURL, language } = req.body;

    let uid = bodyUid;
    let email = bodyEmail;
    let userName = (name || displayName || (email ? email.split('@')[0] : '')).trim();
    let userPhoto = photo || photoURL || '';

    // Verify Firebase ID token if provided
    if (idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        email = decodedToken.email || email;
        userName = (decodedToken.name || userName || (email ? email.split('@')[0] : 'User')).trim();
        userPhoto = decodedToken.picture || userPhoto;
      } catch (tokenErr) {
        console.warn('Google Auth Token Verification Warning:', tokenErr.message);
      }
    }

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'Google UID and Email are required.' });
    }

    let user = await User.findOne({ $or: [{ uid }, { email: email.toLowerCase() }] });

    if (user) {
      // Update existing user
      user.uid = uid;
      user.lastLogin = new Date();
      if (!user.name) user.name = userName;
      if (!user.displayName) user.displayName = userName;
      if (userPhoto && !user.photo) user.photo = userPhoto;
      if (language) user.language = language;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Google login successful. Last login updated.',
        isNewUser: false,
        user
      });
    }

    // Create new user for Google login
    user = await User.create({
      uid,
      name: userName,
      displayName: userName,
      email: email.toLowerCase(),
      photo: userPhoto,
      language: language || 'en',
      role: 'user',
      isVerified: true,
      lastLogin: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Google registration successful. User created in MongoDB.',
      isNewUser: true,
      user
    });
  } catch (error) {
    console.error('Google Auth API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during Google Authentication.' });
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/user/profile or GET /api/users/me
 * @access  Protected
 */
export const getUserProfile = async (req, res) => {
  try {
    let user = req.user;

    if (user && req.decodedToken && user.uid !== req.decodedToken.uid) {
      user.uid = req.decodedToken.uid;
      await user.save();
    }

    if (!user && req.decodedToken) {
      const { uid, email, name, picture, phone_number, email_verified } = req.decodedToken;
      const userName = (name || (email ? email.split('@')[0] : 'User')).trim();

      user = await User.create({
        uid,
        name: userName,
        displayName: userName,
        email: email ? email.toLowerCase() : '',
        photo: picture || '',
        phone: phone_number || '',
        language: 'en',
        role: 'user',
        isVerified: email_verified || false,
        lastLogin: new Date()
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found and could not be created.' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get Profile API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving user profile.' });
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/user/profile
 * @access  Protected
 */
export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    let user = req.user;
    const { name, displayName, phone, language, photo, isVerified } = req.body;

    if (name !== undefined) {
      user.name = name.trim();
      user.displayName = name.trim();
    } else if (displayName !== undefined) {
      user.name = displayName.trim();
      user.displayName = displayName.trim();
    }
    if (phone !== undefined) user.phone = phone;
    if (language !== undefined) user.language = language;
    if (photo !== undefined) user.photo = photo;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user
    });
  } catch (error) {
    console.error('Update Profile API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

/**
 * @desc    Logout User Endpoint (Audit/Log)
 * @route   POST /api/auth/logout
 * @access  Public / Protected
 */
export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @desc    Request Password Reset Email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  console.log(`\n[ForgotPassword] 📥 Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log(`[ForgotPassword] 📧 Target Email: "${req.body?.email}"`);

  try {
    const { email } = req.body;

    // 1. Check email is provided
    if (!email || !email.trim()) {
      console.warn('[ForgotPassword] ⚠️ Validation Error: Email address is required.');
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    // 2. Validate email format
    const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailFormatRegex.test(normalizedEmail)) {
      console.warn(`[ForgotPassword] ⚠️ Validation Error: Invalid email format "${normalizedEmail}"`);
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // 3. Look up the email in database (exact match first, then case-insensitive regex match)
    console.log(`[ForgotPassword] 🔍 Looking up email in database: "${normalizedEmail}"`);
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const escapedEmail = normalizedEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      user = await User.findOne({ email: { $regex: new RegExp(`^\\s*${escapedEmail}\\s*$`, 'i') } });
      if (user) {
        console.log(`[ForgotPassword] 🔍 Found user via case-insensitive regex match: ${user.email}`);
      }
    }

    if (!user) {
      console.warn(`[ForgotPassword] ⚠️ User not in MongoDB by email. Checking Firebase Auth for: "${normalizedEmail}"`);
      try {
        const { getAuth } = await import('firebase-admin/auth');
        const firebaseAuth = getAuth();
        const fbUser = await firebaseAuth.getUserByEmail(normalizedEmail);
        if (fbUser) {
          user = await User.findOne({ uid: fbUser.uid });
          if (user) {
            user.email = normalizedEmail;
            await user.save();
            console.log(`[ForgotPassword] 🔄 Updated MongoDB user email for existing UID: ${user.uid}`);
          } else {
            user = await User.create({
              uid: fbUser.uid,
              email: normalizedEmail,
              displayName: fbUser.displayName || normalizedEmail.split('@')[0],
              name: fbUser.displayName || normalizedEmail.split('@')[0],
              provider: fbUser.providerData?.[0]?.providerId || 'email',
              isVerified: fbUser.emailVerified || false
            });
            console.log(`[ForgotPassword] ➕ Provisioned MongoDB user for existing Firebase user: ${normalizedEmail}`);
          }
        }
      } catch (fbLookupErr) {
        console.warn(`[ForgotPassword] Firebase user lookup notice: ${fbLookupErr.message}`);
      }
    }

    if (!user) {
      console.warn(`[ForgotPassword] ⚠️ User Not Found: No account registered with email "${normalizedEmail}"`);
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    console.log(`[ForgotPassword] ✅ Account verified: uid=${user.uid}, email=${user.email}, provider=${user.provider || 'email'}`);

    // 4. Generate secure random token and hash it for storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const recipientEmail = normalizedEmail;
    user.email = recipientEmail;
    user.resetToken = hashedToken;
    user.resetTokenExpiry = expiry;
    await user.save();
    console.log(`[ForgotPassword] 🔑 Secure token generated and hashed (SHA-256) in DB for ${recipientEmail}. Expires at: ${expiry.toISOString()}`);

    // 5. Build the reset link — dynamically detect client origin (local or prod), fallback to configured env var
    let frontendUrl = req.headers.origin;
    if (!frontendUrl && req.headers.referer) {
      try {
        frontendUrl = new URL(req.headers.referer).origin;
      } catch (e) {
        frontendUrl = req.headers.referer;
      }
    }
    if (!frontendUrl) {
      const rawEnvUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL_PROD || 'https://vaseegrah-veda-catering-xer9.vercel.app';
      let cleanUrl = String(rawEnvUrl).trim();
      if ((cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) || (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))) {
        cleanUrl = cleanUrl.slice(1, -1).trim();
      }
      frontendUrl = cleanUrl.replace(/\/+$/, '');
    } else {
      frontendUrl = frontendUrl.trim().replace(/\/+$/, '');
    }

    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(recipientEmail)}`;
    const maskedLink = `${frontendUrl}/reset-password?token=${rawToken.substring(0, 6)}...[REDACTED]&email=${encodeURIComponent(recipientEmail)}`;

    console.log(`[ForgotPassword] 🔗 Reset URL constructed: ${maskedLink}`);
    console.log(`[ForgotPassword] 📤 Stage 1: Application validation — SUCCESS`);
    console.log(`[ForgotPassword] 📤 Stage 2: Token generation & DB record — SUCCESS`);
    console.log(`[ForgotPassword] 📤 Stage 3: SMTP submission dispatching to: ${recipientEmail}...`);

    // 6. Send the email wrapped in safety try-catch block
    let emailResult;
    try {
      emailResult = await sendPasswordResetEmail(recipientEmail, resetLink);
    } catch (mailError) {
      console.error('[ForgotPassword] ❌ Exception thrown during email dispatch:', mailError);
      emailResult = { success: false, error: mailError?.message || 'Failed to dispatch reset email.' };
    }

    if (!emailResult || !emailResult.success) {
      console.error(`[ForgotPassword] ❌ Stage 4: SMTP Submission FAILED: ${emailResult?.error || 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        message: emailResult?.error || 'Failed to send reset email. Please try again later.'
      });
    }

    console.log(`[ForgotPassword] ✅ Stage 4: SMTP Submission SUCCESS`);
    console.log(`[ForgotPassword]    • Message ID : ${emailResult.messageId}`);
    console.log(`[ForgotPassword]    • Accepted   : ${JSON.stringify(emailResult.accepted || [])}`);
    console.log(`[ForgotPassword]    • Rejected   : ${JSON.stringify(emailResult.rejected || [])}`);
    console.log(`[ForgotPassword]    • Response   : ${emailResult.response || 'OK'}`);
    console.log(`[ForgotPassword] ℹ️  Stage 5 (Downstream): Email accepted by SMTP server for transport.`);
    console.log(`[ForgotPassword]    Final inbox placement is subject to recipient's email provider heuristics (Spam/Junk/Promotions/Corporate filtering).`);

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox (and spam/promotions folder).'
    });
  } catch (error) {
    console.error('[ForgotPassword] 💥 Server Exception Error:', error);
    let errorMessage = 'Server error processing password reset request.';
    if (error.name === 'MongoServerSelectionError' || error.code === 'ETIMEDOUT' || error.name === 'MongooseError') {
      errorMessage = 'Database connection timed out. Please check network connectivity and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

/**
 * @desc    Verify if reset token is valid & not expired
 * @route   POST /api/auth/verify-reset-token
 * @access  Public
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMS',
        message: 'Reset link is invalid.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const escapedEmail = normalizedEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      user = await User.findOne({ email: { $regex: new RegExp(`^\\s*${escapedEmail}\\s*$`, 'i') } });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'No account found with this email address.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    if (user.resetToken !== hashedToken) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Reset link is invalid.'
      });
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry <= new Date()) {
      return res.status(400).json({
        success: false,
        code: 'EXPIRED_TOKEN',
        message: 'Reset link has expired.'
      });
    }

    return res.status(200).json({
      success: true,
      email: user.email,
      message: 'Token is valid.'
    });
  } catch (error) {
    console.error('Verify Reset Token Error:', error);
    return res.status(500).json({
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Server error verifying reset token.'
    });
  }
};

/**
 * @desc    Verify token and set new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, email } = req.body;
    const newPassword = req.body.newPassword || req.body.password;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMS',
        message: 'Token, email, and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const escapedEmail = normalizedEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      user = await User.findOne({ email: { $regex: new RegExp(`^\\s*${escapedEmail}\\s*$`, 'i') } });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'No account found with this email address.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    if (user.resetToken !== hashedToken) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Reset link is invalid or has already been used.'
      });
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry <= new Date()) {
      return res.status(400).json({
        success: false,
        code: 'EXPIRED_TOKEN',
        message: 'Reset link has expired. Please request a new password reset.'
      });
    }

    // Update password in Firebase Auth (Universal for ALL users)
    try {
      const { getApps } = await import('firebase-admin/app');
      const apps = getApps();
      if (apps.length > 0) {
        const { getAuth } = await import('firebase-admin/auth');
        const firebaseAuth = getAuth();
        const hasAdminCredentials = !!process.env.FIREBASE_CLIENT_EMAIL && !!process.env.FIREBASE_PRIVATE_KEY;
        
        if (hasAdminCredentials) {
          let updated = false;

          // 1. Primary: Try updating by stored user.uid
          if (user.uid) {
            try {
              await firebaseAuth.updateUser(user.uid, { password: newPassword });
              console.log(`[ResetPassword] ✅ Firebase password updated for uid: ${user.uid}`);
              updated = true;
            } catch (uidErr) {
              console.warn(`[ResetPassword] ⚠️ updateByUid failed (${uidErr.message}), attempting email lookup fallback...`);
            }
          }

          // 2. Secondary: Find user in Firebase Auth by email and update password
          if (!updated) {
            try {
              const fbUser = await firebaseAuth.getUserByEmail(normalizedEmail);
              if (fbUser?.uid) {
                await firebaseAuth.updateUser(fbUser.uid, { password: newPassword });
                // Also sync user.uid in MongoDB if it differed
                user.uid = fbUser.uid;
                console.log(`[ResetPassword] ✅ Firebase password updated via email lookup for uid: ${fbUser.uid}`);
                updated = true;
              }
            } catch (emailErr) {
              // 3. Fallback: If user account exists in DB but not in Firebase Auth, create Firebase user
              if (emailErr.code === 'auth/user-not-found') {
                console.log(`[ResetPassword] ➕ Provisioning Firebase Auth user for: ${normalizedEmail}`);
                const newUser = await firebaseAuth.createUser({
                  email: normalizedEmail,
                  password: newPassword,
                  displayName: user.displayName || user.name || normalizedEmail.split('@')[0],
                  emailVerified: true
                });
                user.uid = newUser.uid;
                updated = true;
                console.log(`[ResetPassword] ✅ Created Firebase user with uid: ${newUser.uid}`);
              } else {
                throw emailErr;
              }
            }
          }
        } else {
          console.warn('[ResetPassword] ⚠️ Firebase Admin credentials missing — skipping Firebase password update.');
        }
      }
    } catch (firebaseError) {
      console.error('[ResetPassword] ❌ Firebase password update error:', firebaseError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to update authentication credentials: ' + firebaseError.message
      });
    }

    // Invalidate the token immediately
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    console.log(`[ResetPassword] ✅ Token invalidated for: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};

/**
 * @desc    Get configured sender emails
 * @route   GET /api/auth/sender-emails
 * @access  Public
 */
export const getSenderEmails = async (req, res) => {
  try {
    const users = (process.env.EMAIL_USER || '').split(',').map(s => s.trim()).filter(Boolean);
    return res.status(200).json({ success: true, emails: users });
  } catch (error) {
    console.error('Get Sender Emails Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving sender emails.' });
  }
};
