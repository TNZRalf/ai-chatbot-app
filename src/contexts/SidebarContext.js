import React, { createContext, useState } from 'react';

// Default context value
const defaultContextValue = {
  sidebarOpen: true,
  setSidebarOpen: () => {
    console.warn('setSidebarOpen called without SidebarProvider');
  }
};

export const SidebarContext = createContext(defaultContextValue);

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};
