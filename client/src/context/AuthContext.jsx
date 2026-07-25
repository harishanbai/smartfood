import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  signInWithCustomToken
} from '../firebase';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smart_lunch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [mongoUser, setMongoUser] = useState(() => {
    const savedMongo = localStorage.getItem('smart_lunch_mongo_user');
    return savedMongo ? JSON.parse(savedMongo) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync MongoDB Profile
  const syncMongoProfile = async (uid, email) => {
    try {
      const res = await userApi.getProfile(uid);
      if (res?.data?.success && res.data.user) {
        setMongoUser(res.data.user);
        localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      // Log true errors (e.g., 500s or network issues), but don't treat them as fatal to the auth flow
      console.error("MongoDB Profile Sync Error:", err?.response?.data?.message || err.message);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified || false
        };
        setCurrentUser(userData);
        localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
        await syncMongoProfile(user.uid, user.email);
      } else {
        setCurrentUser(null);
        setMongoUser(null);
        localStorage.removeItem('smart_lunch_user');
        localStorage.removeItem('smart_lunch_mongo_user');
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firebase Auth state notice:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Map Firebase errors to human-friendly messages
  const getFriendlyError = (error) => {
    const code = error.code || '';
    const msg = error.message || '';

    if (code === 'auth/email-already-in-use') {
      return 'This email is already registered. Please sign in instead.';
    } else if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    } else if (code === 'auth/weak-password') {
      return 'Password is too weak. Please choose a stronger password.';
    } else if (code === 'auth/invalid-credential') {
      return 'Invalid email or password.';
    } else if (code === 'auth/user-not-found') {
      return 'No account was found with this email address.';
    } else if (code === 'auth/wrong-password') {
      return 'Incorrect password.';
    } else if (code === 'auth/operation-not-allowed') {
      return 'Email and password authentication is not enabled.';
    } else if (code === 'auth/too-many-requests') {
      return 'Too many reset requests. Please try again later.';
    } else if (code === 'auth/popup-closed-by-user') {
      return 'Sign-In popup was closed before completing.';
    } else if (code === 'auth/network-request-failed') {
      return 'Network error. Please check your internet connection and try again.';
    }
    return 'An error occurred during authentication. Please try again.';
  };

  // 1. Email & Password Registration Flow
  const registerWithEmailPassword = async (data) => {
    const { firstName, lastName, email, password, phone, language } = data;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const displayName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

      // Update Firebase Profile displayName
      try {
        await updateFirebaseProfile(user, { displayName });
      } catch (e) {
        console.warn("Firebase updateProfile notice:", e);
      }

      // Send Verification Email
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn("Verification Email notice:", e);
      }

      // Create/Sync user in MongoDB
      const mongoPayload = {
        uid: user.uid,
        firstName,
        lastName,
        displayName,
        email: user.email,
        phone: phone || '',
        language: language || 'en',
        isVerified: user.emailVerified || false,
        photo: user.photoURL || ''
      };

      const res = await authApi.register(mongoPayload);
      const dbUser = res?.data?.user || mongoPayload;

      const userData = {
        uid: user.uid,
        displayName,
        email: user.email,
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified || false
      };

      setCurrentUser(userData);
      setMongoUser(dbUser);
      localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
      localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(dbUser));

      return { success: true, user: userData, dbUser };
    } catch (error) {
      console.error("Registration Error:", error);
      return { success: false, error: getFriendlyError(error) };
    }
  };

  // 2. Email & Password Login Flow
  const loginWithEmailPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Sync backend login
      let dbUser = null;
      try {
        const res = await authApi.login({ uid: user.uid, email: user.email });
        dbUser = res?.data?.user || null;
      } catch (e) {
        console.warn("Backend login sync notice:", e);
      }

      const userData = {
        uid: user.uid,
        displayName: user.displayName || dbUser?.displayName || email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL || dbUser?.photo || '',
        emailVerified: user.emailVerified || false
      };

      setCurrentUser(userData);
      if (dbUser) setMongoUser(dbUser);
      localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
      if (dbUser) localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(dbUser));

      return { success: true, user: userData, dbUser };
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: getFriendlyError(error) };
    }
  };

  // 3. Google Sign-In Flow
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const googlePayload = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0],
        email: user.email,
        photoURL: user.photoURL || '',
        language: localStorage.getItem('language') || 'en'
      };

      let dbUser = null;
      try {
        const res = await authApi.google(googlePayload);
        dbUser = res?.data?.user || null;
      } catch (e) {
        console.warn("Google backend sync notice:", e);
      }

      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        emailVerified: true
      };

      setCurrentUser(userData);
      if (dbUser) setMongoUser(dbUser);
      localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
      if (dbUser) localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(dbUser));

      return { success: true, user: userData, dbUser };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      return { success: false, error: getFriendlyError(error) };
    }
  };

  // 3b. WhatsApp OTP Flow
  const requestWhatsappOtp = async (phone) => {
    try {
      const res = await authApi.sendWhatsappOtp(phone);
      if (res?.data?.success) {
        return { success: true, message: res.data.message, phone: res.data.phone };
      }
      return { success: false, error: res?.data?.message || 'Failed to send OTP.' };
    } catch (error) {
      console.error("WhatsApp Send OTP Error:", error);
      return { success: false, error: error?.response?.data?.message || error.message || 'Failed to send OTP.' };
    }
  };

  const verifyWhatsappOtp = async (phone, otp) => {
    try {
      const res = await authApi.verifyWhatsappOtp(phone, otp);
      if (res?.data?.success && res.data.user) {
        const dbUser = res.data.user;
        const customToken = res.data.token;

        // Sign in via Firebase Custom Token if present
        if (customToken) {
          try {
            await signInWithCustomToken(auth, customToken);
          } catch (fbErr) {
            console.warn("Firebase Custom Token sign-in warning:", fbErr);
          }
        }

        const userData = {
          uid: dbUser.uid,
          displayName: dbUser.displayName || `User (${phone.slice(-4)})`,
          email: dbUser.email || '',
          photoURL: dbUser.photo || '',
          emailVerified: true
        };

        setCurrentUser(userData);
        setMongoUser(dbUser);
        localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
        localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(dbUser));

        return { success: true, user: userData, dbUser };
      }
      return { success: false, error: res?.data?.message || 'Verification failed.' };
    } catch (error) {
      console.error("WhatsApp Verify OTP Error:", error);
      return { success: false, error: error?.response?.data?.message || error.message || 'OTP Verification failed.' };
    }
  };

  // 4. Password Reset Flow — uses backend Nodemailer (not Firebase SDK directly)
  const sendPasswordReset = async (email) => {
    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res?.data?.success) {
        return { success: true };
      }
      return { success: false, error: res?.data?.message || 'Failed to send reset email.' };
    } catch (error) {
      console.error('Password Reset Error:', error?.response?.data || error.message);
      const serverMsg = error?.response?.data?.message;
      return { success: false, error: serverMsg || 'Failed to send reset email. Please try again.' };
    }
  };

  // 5. Resend Verification Email
  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'No authenticated user found.' };
    } catch (error) {
      console.error("Resend Verification Email Error:", error);
      return { success: false, error: getFriendlyError(error) };
    }
  };

  // 6. Update User Profile
  const updateUserProfile = async (profileData) => {
    try {
      if (!currentUser?.uid) return { success: false, error: 'User not authenticated' };

      const res = await userApi.updateProfile({ uid: currentUser.uid, ...profileData });
      if (res?.data?.success && res.data.user) {
        const updatedDbUser = res.data.user;
        setMongoUser(updatedDbUser);
        localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(updatedDbUser));

        const updatedUser = {
          ...currentUser,
          displayName: updatedDbUser.displayName || currentUser.displayName,
          photoURL: updatedDbUser.photo || currentUser.photoURL
        };

        setCurrentUser(updatedUser);
        localStorage.setItem('smart_lunch_user', JSON.stringify(updatedUser));

        if (auth.currentUser && updatedDbUser.displayName) {
          try {
            await updateFirebaseProfile(auth.currentUser, {
              displayName: updatedDbUser.displayName,
              photoURL: updatedDbUser.photo || auth.currentUser.photoURL
            });
          } catch (e) {
            console.warn("Firebase profile update sync notice:", e);
          }
        }

        return { success: true, user: updatedDbUser };
      }
      return { success: false, error: res?.data?.message || 'Failed to update profile' };
    } catch (error) {
      console.error("Update Profile Error:", error);
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  };

  // 7. Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore API logout error
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("SignOut notice:", err);
    }
    setCurrentUser(null);
    setMongoUser(null);
    localStorage.removeItem('smart_lunch_user');
    localStorage.removeItem('smart_lunch_mongo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        mongoUser,
        loading,
        loginWithEmailPassword,
        registerWithEmailPassword,
        loginWithGoogle,
        requestWhatsappOtp,
        verifyWhatsappOtp,
        sendPasswordReset,
        resendVerificationEmail,
        updateUserProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
