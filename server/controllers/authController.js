import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

/**
 * @desc    Register / Sync new user to MongoDB after Firebase Auth
 * @route   POST /api/auth/register
 * @access  Public / Protected
 */
export const registerUser = async (req, res) => {
  try {
    const { uid, firstName, lastName, displayName, email, phone, language, isVerified, photo } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'UID and Email are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ uid }, { email: email.toLowerCase() }] });
    
    if (existingUser) {
      // Update existing record
      existingUser.uid = uid;
      if (firstName) existingUser.firstName = firstName;
      if (lastName) existingUser.lastName = lastName;
      existingUser.displayName = displayName || `${firstName || ''} ${lastName || ''}`.trim() || existingUser.displayName;
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
      firstName: firstName || '',
      lastName: lastName || '',
      displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
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
    const { uid, displayName, name, email, photo, photoURL, language } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'Google UID and Email are required.' });
    }

    let user = await User.findOne({ $or: [{ uid }, { email: email.toLowerCase() }] });

    const userPhoto = photo || photoURL || '';
    const userName = displayName || name || email.split('@')[0];
    const nameParts = userName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (user) {
      // Update existing user
      user.uid = uid;
      user.lastLogin = new Date();
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
      firstName,
      lastName,
      displayName: userName,
      email: email.toLowerCase(),
      photo: userPhoto,
      language: language || 'en',
      role: 'user',
      isVerified: true, // Google accounts are pre-verified
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
    console.log('--- getUserProfile executing ---');
    console.log('req.user:', req.user);
    console.log('req.decodedToken:', req.decodedToken);

    let user = req.user;

    // If user exists (found by email in middleware) but UID doesn't match, link the UID
    if (user && req.decodedToken && user.uid !== req.decodedToken.uid) {
      user.uid = req.decodedToken.uid;
      await user.save();
    }

    // If MongoDB profile doesn't exist but Firebase token is valid, auto-create it
    if (!user && req.decodedToken) {
      console.log('Auto-creating user...');
      const { uid, email, name, picture, phone_number, email_verified } = req.decodedToken;

      const userName = name || (email ? email.split('@')[0] : 'User');
      const nameParts = userName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = await User.create({
        uid,
        firstName,
        lastName,
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

    const { firstName, lastName, displayName, phone, language, photo, isVerified } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (displayName !== undefined) user.displayName = displayName;
    else if (firstName !== undefined || lastName !== undefined) {
      user.displayName = `${user.firstName} ${user.lastName}`.trim();
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
  console.log('\n[ForgotPassword] ─────────────────────────────────────────');
  console.log('[ForgotPassword] 📨 Request received');
  console.log(`[ForgotPassword]    Body: ${JSON.stringify(req.body)}`);

  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      console.warn('[ForgotPassword] ⚠️  No email address provided in request body.');
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[ForgotPassword] 🔍 Looking up user in MongoDB: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.warn(`[ForgotPassword] ❌ No MongoDB user found for email: ${normalizedEmail}`);
      return res.status(404).json({ success: false, message: 'No account found with that email address.' });
    }

    console.log(`[ForgotPassword] ✅ User found: ${user.displayName || user.email} (uid: ${user.uid})`);

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`[ForgotPassword] 🔑 Token generated. Expires at: ${expiry.toISOString()}`);

    user.resetToken = hashedToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    console.log('[ForgotPassword] 💾 Token saved to MongoDB.');

    // Build reset URL — raw token goes to the frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    console.log('[ForgotPassword] 📧 Calling sendPasswordResetEmail...');
    const emailResult = await sendPasswordResetEmail(user.email, resetLink);

    if (emailResult.mode === 'console') {
      // SMTP not configured — console-only mode is fine for local dev
      console.log('[ForgotPassword] ℹ️  SMTP not configured. Running in console-only mode.');
      return res.status(200).json({
        success: true,
        message: 'Reset link generated. SMTP is not configured — check the server console for the link.'
      });
    }

    if (!emailResult.success) {
      // SMTP IS configured but sending failed — return a real 500
      console.error('[ForgotPassword] ❌ SMTP configured but email failed to send.');
      console.error(`[ForgotPassword]    Reason: ${emailResult.error}`);
      return res.status(500).json({
        success: false,
        message: `Failed to send reset email: ${emailResult.error}`
      });
    }

    console.log(`[ForgotPassword] ✅ Reset email delivered successfully to ${user.email}`);
    console.log('[ForgotPassword] ─────────────────────────────────────────\n');

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('[ForgotPassword] 💥 Unhandled error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing password reset request.' });
  }
};

/**
 * @desc    Verify token and set new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token, email, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    // Hash the raw token and look it up in the DB
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() } // must not be expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.'
      });
    }

    // Update password in Firebase Authentication via Admin SDK
    try {
      const { getAuth } = await import('firebase-admin/auth');
      await getAuth().updateUser(user.uid, { password: newPassword });
    } catch (firebaseError) {
      console.error('[ResetPassword] Firebase password update error:', firebaseError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password in Firebase. Please try again.'
      });
    }

    // Clear the reset token from MongoDB
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    console.log(`[ResetPassword] ✅ Password reset successful for ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};
