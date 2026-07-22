import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smart_lunch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || ''
        };
        setCurrentUser(userData);
        localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
      } else {
        const saved = localStorage.getItem('smart_lunch_user');
        if (!saved) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firebase Auth state notice:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };
      setCurrentUser(userData);
      localStorage.setItem('smart_lunch_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error("Firebase Google Sign-In Error:", error);
      
      let friendlyError = 'Google Sign-In failed. Please try again.';
      const code = error.code || '';
      const msg = error.message || '';

      if (code === 'auth/configuration-not-found' || msg.includes('CONFIGURATION_NOT_FOUND')) {
        friendlyError = 'Google Sign-In is not enabled in your Firebase Console yet. Please enable it in Firebase Console -> Authentication -> Sign-in method -> Google.';
      } else if (code === 'auth/popup-closed-by-user') {
        friendlyError = 'Sign-In popup was closed before completing.';
      } else if (code === 'auth/unauthorized-domain') {
        friendlyError = 'This domain is not authorized in your Firebase Console (Authentication -> Settings -> Authorized domains).';
      } else if (code === 'auth/operation-not-allowed') {
        friendlyError = 'Google Sign-In is not enabled in your Firebase Console (Authentication -> Sign-in method -> Google).';
      } else if (msg) {
        friendlyError = msg;
      }

      return { success: false, error: friendlyError };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("SignOut notice:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem('smart_lunch_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
