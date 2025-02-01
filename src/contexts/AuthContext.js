import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile, updateUserProfile } from '../services/firebaseService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, userData) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      const displayName = `${userData.firstName} ${userData.lastName}`;
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        ...userData,
        displayName,
        lastLogin: new Date()
      });

      setUser(user);
      return { user };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      await updateUserProfile(result.user.uid, {
        lastLogin: new Date()
      });

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Update or create user profile
      await createUserProfile(result.user.uid, {
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: new Date()
      });

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      setError(null);
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Update or create user profile
      await createUserProfile(result.user.uid, {
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: new Date()
      });

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
