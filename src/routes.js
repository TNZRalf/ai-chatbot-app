import React from 'react';
import { Navigate } from 'react-router-dom';
import App from './App';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ChatPage from './pages/ChatPage';

// This is a placeholder. In a real app, you'd implement proper authentication
const isAuthenticated = () => {
  return true; // For demo purposes, always return true
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

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
    path: '/chat',
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
