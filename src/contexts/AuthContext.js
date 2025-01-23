import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${serverUrl}/auth/me`);
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${serverUrl}/auth/login`, {
        email,
        password
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during login');
      throw err;
    }
  };

  const signup = async (username, email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${serverUrl}/auth/signup`, {
        username,
        email,
        password
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during signup');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${serverUrl}/auth/logout`);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUser = async (formData) => {
    try {
      setError(null);
      const response = await axios.put(`${serverUrl}/auth/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while updating profile');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
