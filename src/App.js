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
import CVEditor from './components/CVEditor';
import TodoList from './components/TodoList';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CVProvider } from './contexts/CVContext';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper component to handle authenticated routes
const AuthenticatedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Wrapper component to handle public routes
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/home" />;
};

function App() {
  return (
    <AuthProvider>
      <CVProvider>
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
                  {/* Public Routes */}
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

                  {/* Protected Routes */}
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
                      <AuthenticatedRoute>
                        <InterfaceSettings />
                      </AuthenticatedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <AuthenticatedRoute>
                        <InterfaceSettings />
                      </AuthenticatedRoute>
                    }
                  />
                  <Route
                    path="/resume-parser"
                    element={
                      <AuthenticatedRoute>
                        <ResumeParser />
                      </AuthenticatedRoute>
                    }
                  />
                  <Route
                    path="/cv/edit"
                    element={
                      <AuthenticatedRoute>
                        <CVEditor />
                      </AuthenticatedRoute>
                    }
                  />
                  <Route
                    path="/to-do-list"
                    element={
                      <AuthenticatedRoute>
                        <TodoList />
                      </AuthenticatedRoute>
                    }
                  />

                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SidebarProvider>
            </Box>
          </LocalizationProvider>
        </ThemeProvider>
      </CVProvider>
    </AuthProvider>
  );
}

export default App;