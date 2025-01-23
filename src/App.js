import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Chat from './components/Chat';
import Landing from './components/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import { SidebarProvider } from './contexts/SidebarContext';

function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </SidebarProvider>
  );
}

export default App;