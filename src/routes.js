import React from 'react';
import { Navigate } from 'react-router-dom';
import App from './App';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ResumeParser from './components/ResumeParser';
import AiChat from './components/AiChat';
import { useAuth } from './contexts/AuthContext';

// This is a placeholder. In a real app, you'd implement proper authentication
// const isAuthenticated = () => {
//   return true; // For demo purposes, always return true
// };

const AuthenticatedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

// const ProtectedRoute = ({ children }) => {
//   if (!isAuthenticated()) {
//     return <Navigate to="/signin" replace />;
//   }
//   return children;
// };

const routes = [
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/resume-parser',
    element: (
      <AuthenticatedRoute>
        <ResumeParser />
      </AuthenticatedRoute>
    ),
  },
  {
    path: '/chat',
    element: (
      <AuthenticatedRoute>
        <AiChat />
      </AuthenticatedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default routes;
