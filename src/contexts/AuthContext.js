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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update last login time when user signs in
        try {
          await updateUserProfile(user.uid, {
            lastLogin: new Date()
          });
        } catch (err) {
          console.error('Error updating last login:', err);
        }
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, username) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(user, { displayName: username });
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        username,
        email,
        createdAt: new Date(),
        lastLogin: new Date(),
        photoURL: null
      });
      
      setUser(user);
      return { user };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return { user: result.user };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create/update user profile
      await createUserProfile(result.user.uid, {
        username: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        lastLogin: new Date()
      });
      
      setUser(result.user);
      return { user: result.user };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithFacebook = async () => {
    try {
      setError(null);
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create/update user profile
      await createUserProfile(result.user.uid, {
        username: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        lastLogin: new Date()
      });
      
      setUser(result.user);
      return { user: result.user };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
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
