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
import { createUserProfile, updateUserProfile, getUserProfile } from '../services/firebaseService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, userData) => {
    try {
      setError(null);
      console.log('Creating new user account...');
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      const displayName = `${userData.firstName} ${userData.lastName}`;
      await updateProfile(user, { displayName });
      
      console.log('Creating user profile...');
      await createUserProfile(user.uid, {
        ...userData,
        displayName,
        email: user.email,
        lastLogin: new Date()
      });

      setCurrentUser(user);
      return { user };
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with email:', email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful for user:', result.user.email);
      
      // Update last login time
      await updateUserProfile(result.user.uid, {
        lastLogin: new Date()
      });

      return result;
    } catch (error) {
      console.error('Login error:', {
        code: error.code,
        message: error.message
      });
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
      console.error('Google login error:', error);
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
      console.error('Facebook login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
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
