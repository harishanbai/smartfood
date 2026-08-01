import express from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  getSenderEmails
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOtp, verifyOtp } from '../controllers/whatsappController.js';

const router = express.Router();

// Auth Endpoints (supports both /api/auth/* and /api/*)
router.post('/auth/register', registerUser);
router.post('/register', registerUser);

router.post('/auth/login', loginUser);
router.post('/login', loginUser);

router.post('/auth/google', googleAuth);
router.post('/google', googleAuth);

router.post('/auth/logout', logoutUser);
router.post('/logout', logoutUser);

router.post('/auth/forgot-password', forgotPassword);
router.post('/forgot-password', forgotPassword);

router.post('/auth/verify-reset-token', verifyResetToken);
router.post('/verify-reset-token', verifyResetToken);

router.post('/auth/reset-password', resetPassword);
router.post('/reset-password', resetPassword);

router.get('/auth/sender-emails', getSenderEmails);
router.get('/sender-emails', getSenderEmails);

// Auth Health / Test Endpoints
router.get(['/auth/test', '/test'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth routes are working and reachable.',
    timestamp: new Date().toISOString()
  });
});

// WhatsApp Auth Endpoints
router.post('/auth/whatsapp/send-otp', sendOtp);
router.post('/auth/whatsapp/verify-otp', verifyOtp);

// User Profile Endpoints
router.get('/user/profile', protect, getUserProfile);
router.put('/user/profile', protect, updateUserProfile);
router.get('/users/me', protect, getUserProfile);

export default router;
