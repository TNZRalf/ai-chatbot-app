import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem('fontSize');
    return savedSize ? JSON.parse(savedSize) : 'medium';
  });

  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const savedAnimations = localStorage.getItem('animationsEnabled');
    return savedAnimations ? JSON.parse(savedAnimations) : true;
  });

  const [contrastMode, setContrastMode] = useState(() => {
    const savedContrast = localStorage.getItem('contrastMode');
    return savedContrast ? JSON.parse(savedContrast) : 'normal';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('fontSize', JSON.stringify(fontSize));
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
    localStorage.setItem('contrastMode', JSON.stringify(contrastMode));
    
    // Apply dark mode to body
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#ffffff';
    document.body.style.color = isDarkMode ? '#ffffff' : '#000000';
  }, [isDarkMode, fontSize, animationsEnabled, contrastMode]);

  // Create MUI theme based on dark mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#90caf9' : '#1976d2',
      },
      background: {
        default: isDarkMode ? '#121212' : '#ffffff',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontSize: fontSize === 'small' ? 14 : fontSize === 'large' ? 16 : 15,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            backgroundColor: isDarkMode ? '#121212' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          },
        },
      },
    },
  });

  const value = {
    isDarkMode,
    setIsDarkMode,
    fontSize,
    setFontSize,
    animationsEnabled,
    setAnimationsEnabled,
    contrastMode,
    setContrastMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
