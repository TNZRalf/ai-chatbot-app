import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Landing from './components/Landing';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
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
        <Box
          sx={{
            bgcolor: 'background.default',
            minHeight: '100vh',
            width: '100%',
          }}
        >
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
                    <SignIn />
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
                path="/settings/interface"
                element={
                  <ProtectedRoute>
                    <InterfaceSettings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SidebarProvider>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;