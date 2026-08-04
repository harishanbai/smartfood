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
  signInWithCustomToken,
  signInWithRedirect,
  getRedirectResult
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
    // Process redirect result if any
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
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
            console.warn("Google redirect backend sync notice:", e);
          }

          const userData = {
            uid: user.uid,
            displayName: user.displayName || googlePayload.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: true
          };

          setCurrentUser(userData);
          if (dbUser) setMongoUser(dbUser);
          localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
          if (dbUser) localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(dbUser));
        }
      } catch (err) {
        console.error("Google Redirect Result handling error:", err);
      }
    };

    handleRedirect();

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
        setLoading(false); // Let the UI render immediately using local cached details

        // Sync from MongoDB in the background
        syncMongoProfile(user.uid, user.email);
      } else {
        setCurrentUser(null);
        setMongoUser(null);
        localStorage.removeItem('smart_lunch_user');
        localStorage.removeItem('smart_lunch_mongo_user');
        setLoading(false);
      }
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
    } else if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized for Google Sign-In. Please add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.';
    } else if (code === 'auth/internal-error') {
      return 'An internal authentication error occurred. Please try again.';
    }
    return 'An error occurred during authentication. Please try again.';
  };

  // 1. Email & Password Registration Flow
  const registerWithEmailPassword = async (data) => {
    const { name, email, password, phone, language } = data;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userName = (name || email.split('@')[0]).trim();

      // Update Firebase Profile displayName
      try {
        await updateFirebaseProfile(user, { displayName: userName });
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
        name: userName,
        displayName: userName,
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
        displayName: userName,
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
      // Check if user is on a mobile device
      const isMobile = /Mobi|Android|iPhone|iPad|Windows Phone/i.test(navigator.userAgent);

      if (isMobile) {
        console.log("[Google Sign-In] Mobile device detected, using signInWithRedirect");
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirecting: true };
      }

      console.log("[Google Sign-In] Initiating popup...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("[Google Sign-In] Success! User:", user.email);

      let idToken = '';
      try {
        idToken = await user.getIdToken();
      } catch (tokenErr) {
        console.warn("[Google Sign-In] Could not fetch ID Token:", tokenErr.message);
      }

      const googlePayload = {
        idToken,
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
        console.log("[Google Sign-In] Backend Sync Success.");
      } catch (e) {
        console.warn("[Google Sign-In] Backend Sync Notice:", e.message || e);
      }

      const userData = {
        uid: user.uid,
        displayName: user.displayName || googlePayload.displayName,
        email: user.email,
        photoURL: user.photoURL || '',
        emailVerified: true
      };

      setCurrentUser(userData);
      if (dbUser) setMongoUser(dbUser);
      localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
      if (dbUser) localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(dbUser));

      return { success: true, user: userData, dbUser };
    } catch (error) {
      console.error("[Google Sign-In] Error:", error.code, error.message);

      // If popup fails or is blocked, try redirect as fallback
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.warn("[Google Sign-In] Popup blocked/closed, falling back to Redirect...");
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true, redirecting: true };
        } catch (redirectErr) {
          console.error("[Google Sign-In] Redirect Error:", redirectErr.code, redirectErr.message);
          return { success: false, error: getFriendlyError(redirectErr) };
        }
      }

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

  // 4. Password Reset Flow — uses backend Nodemailer
  const sendPasswordReset = async (email) => {
    console.log(`[ForgotPassword] 🚀 Initiating reset request for email: "${email.trim()}"`);
    try {
      const res = await authApi.forgotPassword(email.trim());
      console.log(`[ForgotPassword] ✅ Request Succeeded - Status: ${res.status}`, res.data);
      if (res?.data?.success) {
        return { success: true, message: res.data.message || 'Password reset email sent successfully.' };
      }
      return { success: false, error: res?.data?.message || 'Failed to send reset email.' };
    } catch (error) {
      const reqUrl = error?.config?.url || '/auth/forgot-password';
      const statusCode = error?.response?.status || 'No Response (Network / CORS Error)';
      const serverMsg = error?.response?.data?.message;

      console.error(`[ForgotPassword] ❌ Request Failed:`, {
        url: reqUrl,
        statusCode,
        error: serverMsg || error.message
      });

      if (!error?.response) {
        return {
          success: false,
          error: 'Server unavailable. Please check your internet connection or backend status.'
        };
      } else if (statusCode === 404) {
        return {
          success: false,
          error: serverMsg || 'No account found with that email address.'
        };
      } else if (statusCode === 400) {
        return {
          success: false,
          error: serverMsg || 'Please enter a valid email address.'
        };
      } else if (statusCode === 500) {
        return {
          success: false,
          error: serverMsg || 'Failed to send reset email due to a server error.'
        };
      }

      return {
        success: false,
        error: serverMsg || 'Failed to send reset email. Please try again later.'
      };
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
    // Apply local changes immediately so the client-side UI updates instantly
    const localDbUser = {
      ...mongoUser,
      firstName: profileData.firstName || mongoUser?.firstName,
      lastName: profileData.lastName || mongoUser?.lastName,
      displayName: profileData.displayName || mongoUser?.displayName,
      phone: profileData.phone || mongoUser?.phone,
      language: profileData.language || mongoUser?.language,
      photo: profileData.photo || mongoUser?.photo
    };

    setMongoUser(localDbUser);
    localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(localDbUser));

    const localUser = {
      ...currentUser,
      displayName: profileData.displayName || currentUser?.displayName,
      photoURL: profileData.photo || currentUser?.photoURL
    };

    setCurrentUser(localUser);
    localStorage.setItem('smart_lunch_user', JSON.stringify(localUser));

    try {
      if (!currentUser?.uid) return { success: false, error: 'User not authenticated' };

      const res = await userApi.updateProfile({ uid: currentUser.uid, ...profileData });
      if (res?.data?.success && res.data.user) {
        const updatedDbUser = res.data.user;
        setMongoUser(updatedDbUser);
        localStorage.setItem('smart_lunch_mongo_user', JSON.stringify(updatedDbUser));

        const updatedUser = {
          ...localUser,
          displayName: updatedDbUser.displayName || localUser.displayName,
          photoURL: updatedDbUser.photo || localUser.photoURL
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
      // If sync request returned success: false, we still consider local updates successful
      return { success: true, isLocalOnly: true, error: res?.data?.message || 'Sync failed.' };
    } catch (error) {
      console.warn("Update Profile Sync Warning:", error?.response?.data?.message || error.message);
      // Return success: true since local state was successfully updated
      return { success: true, isLocalOnly: true };
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
