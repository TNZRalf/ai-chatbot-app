import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Landing from './components/Landing';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './components/Home';
import ChatPage from './pages/ChatPage';
import InterfaceSettings from './components/InterfaceSettings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper component to handle authenticated routes
const AuthenticatedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Wrapper component to handle public routes
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/home" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CssBaseline />
        <SidebarProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route
              path="/home"
              element={
                <AuthenticatedRoute>
                  <Home />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/interface"
              element={
                <ProtectedRoute>
                  <InterfaceSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;