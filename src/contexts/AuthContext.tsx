import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<{ user: User }>;
  login: (email: string, password: string) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<{ user: User }>;
  loginWithFacebook: () => Promise<{ user: User }>;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => ({ user: {} as User }),
  login: async () => ({ user: {} as User }),
  logout: async () => {},
  loginWithGoogle: async () => ({ user: {} as User }),
  loginWithFacebook: async () => ({ user: {} as User }),
  updateUserProfile: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user };
  };

  // Login function
  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user };
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Google login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  };

  // Facebook login
  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  };

  // Update user profile
  const updateUserProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, profile);
      // Force a refresh of the user object
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
