import React, { createContext, useState, useContext } from 'react';

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Default context value
const defaultContextValue: SidebarContextType = {
  sidebarOpen: true,
  setSidebarOpen: () => {
    console.warn('setSidebarOpen called without SidebarProvider');
  }
};

export const SidebarContext = createContext<SidebarContextType>(defaultContextValue);

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook for using the sidebar context
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
