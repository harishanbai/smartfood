import crypto from 'crypto';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import admin from '../config/firebaseAdmin.js';
import { sendWhatsAppOTP } from '../services/whatsappService.js';

/**
 * Validate phone number format (E.164 with country code)
 * @param {string} phone
 * @returns {string|null} Normalized phone string or null if invalid
 */
const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+')) {
    // If it's a 10-digit Indian mobile number starting with 6-9, automatically prepend +91
    if (/^[6-9]\d{9}$/.test(cleaned)) {
      cleaned = '+91' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  return phoneRegex.test(cleaned) ? cleaned : null;
};

/**
 * @desc    Send OTP to user's WhatsApp number
 * @route   POST /api/auth/whatsapp/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  console.log('\n[WhatsApp Auth] ─────────────────────────────────────────');
  console.log('[WhatsApp Auth] 📩 Request: send-otp');
  console.log(`[WhatsApp Auth] Body:`, req.body);

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required. Please include country code (e.g. +919876543210).'
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please enter a valid mobile number with country code (e.g. +919876543210).'
      });
    }

    // Self-send check: Meta API does not allow sending WhatsApp messages from the sender number to itself
    const senderNumber = process.env.WHATSAPP_PHONE_NUMBER
      ? `+${process.env.WHATSAPP_PHONE_NUMBER.replace(/\D/g, '')}`
      : '+919047484484';
    if (normalizedPhone === senderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send verification OTP to the sender business phone number. Please enter your personal mobile number.'
      });
    }

    // Rate Limit Check: Maximum 3 OTP requests within 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequestsCount = await Otp.countDocuments({
      phone: normalizedPhone,
      createdAt: { $gte: tenMinutesAgo }
    });

    if (recentRequestsCount >= 3) {
      console.warn(`[WhatsApp Auth] ⚠️ Rate limit reached for ${normalizedPhone} (${recentRequestsCount} requests in 10m)`);
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Maximum 3 requests allowed within 10 minutes. Please wait before trying again.'
      });
    }

    // Generate secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    console.log(`[WhatsApp Auth] 🔑 OTP generated for ${normalizedPhone}`);

    // Expiry: 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Overwrite existing active OTPs for this phone number
    await Otp.deleteMany({ phone: normalizedPhone });

    // Store hashed OTP in MongoDB
    await Otp.create({
      phone: normalizedPhone,
      otpHash,
      attempts: 0,
      expiresAt
    });

    console.log(`[WhatsApp Auth] 💾 Hashed OTP saved to database. Expires at: ${expiresAt.toISOString()}`);

    // Send OTP via Meta WhatsApp Cloud API
    const whatsappResult = await sendWhatsAppOTP(normalizedPhone, rawOtp);

    if (!whatsappResult.success) {
      console.error(`[WhatsApp Auth] ❌ OTP delivery failed via Meta API: ${whatsappResult.error}`);
      // Remove unsent OTP document so user does not lose attempts
      await Otp.deleteMany({ phone: normalizedPhone });

      return res.status(400).json({
        success: false,
        message: whatsappResult.error || 'Failed to send WhatsApp message via Meta Cloud API.'
      });
    }

    console.log(`[WhatsApp Auth] ✅ OTP delivered via Meta API. WAMID: ${whatsappResult.messageId}`);
    console.log('[WhatsApp Auth] ─────────────────────────────────────────\n');

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your WhatsApp number.',
      phone: normalizedPhone,
      messageId: whatsappResult.messageId,
      mockOtp: whatsappResult.mockOtp
    });
  } catch (error) {
    console.error('[WhatsApp Auth] 💥 Error in sendOtp:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while sending WhatsApp OTP.'
    });
  }
};

/**
 * @desc    Verify WhatsApp OTP and authenticate user
 * @route   POST /api/auth/whatsapp/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  console.log('\n[WhatsApp Auth] ─────────────────────────────────────────');
  console.log('[WhatsApp Auth] 🔐 Request: verify-otp');

  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Both phone number and OTP code are required.'
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format.'
      });
    }

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit number.'
      });
    }

    // Find active OTP record for this phone
    const otpRecord = await Otp.findOne({ phone: normalizedPhone });

    if (!otpRecord) {
      console.warn(`[WhatsApp Auth] ❌ No active OTP record found for ${normalizedPhone}`);
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new verification code.'
      });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      console.warn(`[WhatsApp Auth] ❌ OTP expired for ${normalizedPhone}`);
      await Otp.deleteMany({ phone: normalizedPhone });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired (valid for 5 minutes). Please request a new code.'
      });
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      console.warn(`[WhatsApp Auth] ❌ Max attempts (5) reached for ${normalizedPhone}`);
      await Otp.deleteMany({ phone: normalizedPhone });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts (5) exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP hash
    const inputHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    if (inputHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = 5 - otpRecord.attempts;
      console.warn(`[WhatsApp Auth] ❌ Incorrect OTP for ${normalizedPhone}. Failed attempt ${otpRecord.attempts}/5`);

      if (remainingAttempts <= 0) {
        await Otp.deleteMany({ phone: normalizedPhone });
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Incorrect OTP code. You have ${remainingAttempts} attempt(s) remaining.`
      });
    }

    // OTP Verified Successfully! Clear OTP record
    console.log(`[WhatsApp Auth] ✅ OTP verified successfully for ${normalizedPhone}`);
    await Otp.deleteMany({ phone: normalizedPhone });

    // Look up user in MongoDB by phone number
    let user = await User.findOne({ phone: normalizedPhone });

    const uid = user ? user.uid : `wa_${normalizedPhone.replace(/\D/g, '')}`;

    // Ensure Firebase User exists so Firebase Admin can generate token
    try {
      if (admin.auth) {
        await admin.auth().getUser(uid).catch(async () => {
          await admin.auth().createUser({
            uid,
            phoneNumber: normalizedPhone,
            displayName: user?.displayName || `WhatsApp User (${normalizedPhone.slice(-4)})`
          }).catch(err => console.warn('[WhatsApp Auth] Firebase createUser notice:', err.message));
        });
      }
    } catch (fbErr) {
      console.warn('[WhatsApp Auth] Firebase sync warning:', fbErr.message);
    }

    if (user) {
      // Update existing user
      user.lastLogin = new Date();
      user.provider = user.provider || 'whatsapp';
      user.whatsappVerified = true;
      user.isVerified = true;
      await user.save();
      console.log(`[WhatsApp Auth] Existing user logged in: ${user.displayName || user.phone} (uid: ${user.uid})`);
    } else {
      // Create new user in MongoDB
      user = await User.create({
        uid,
        displayName: `WhatsApp User (${normalizedPhone.slice(-4)})`,
        phone: normalizedPhone,
        provider: 'whatsapp',
        whatsappVerified: true,
        isVerified: true,
        language: 'en',
        role: 'user',
        lastLogin: new Date()
      });
      console.log(`[WhatsApp Auth] New user registered via WhatsApp: ${user.phone} (uid: ${user.uid})`);
    }

    // Generate Firebase Custom JWT Token for frontend login session
    let token = null;
    try {
      if (admin.auth) {
        token = await admin.auth().createCustomToken(user.uid);
        console.log(`[WhatsApp Auth] Firebase Custom JWT token generated for uid: ${user.uid}`);
      }
    } catch (tokenErr) {
      console.error('[WhatsApp Auth] Failed to generate custom token:', tokenErr.message);
    }

    console.log('[WhatsApp Auth] ─────────────────────────────────────────\n');

    return res.status(200).json({
      success: true,
      message: 'WhatsApp verification successful. Logged in!',
      token,
      user
    });
  } catch (error) {
    console.error('[WhatsApp Auth] 💥 Error in verifyOtp:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification.'
    });
  }
};
