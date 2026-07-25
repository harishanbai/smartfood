import express from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOtp, verifyOtp } from '../controllers/whatsappController.js';

const router = express.Router();

// Auth Endpoints
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/google', googleAuth);
router.post('/auth/logout', logoutUser);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// WhatsApp Auth Endpoints
router.post('/auth/whatsapp/send-otp', sendOtp);
router.post('/auth/whatsapp/verify-otp', verifyOtp);

// User Profile Endpoints
router.get('/user/profile', protect, getUserProfile);
router.put('/user/profile', protect, updateUserProfile);
router.get('/users/me', protect, getUserProfile);

export default router;
