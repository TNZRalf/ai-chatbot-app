import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Landing from './components/Landing';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
import InterfaceSettings from './components/InterfaceSettings';
import ResumeParser from './components/ResumeParser';
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                    <ProtectedRoute>
                      <Home />
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
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <InterfaceSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume-parser"
                  element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <ResumeParser />
                      </SidebarProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </SidebarProvider>
          </Box>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;