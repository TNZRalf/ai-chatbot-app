import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes as ReactRoutes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import App from './App';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ChatPage from './components/Chat';
import { SidebarProvider } from './contexts/SidebarContext';

// This is a placeholder. In a real app, you'd implement proper authentication
const isAuthenticated = (): boolean => {
  return true; // For demo purposes, always return true
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SidebarProvider>
        <Router>
          <ReactRoutes>
            <Route path="/" element={<App />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
          </ReactRoutes>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
