import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import './animations.css';
import { SidebarContext } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';

const Logo = () => {
  const context = useContext(SidebarContext);
  const { isDarkMode } = useTheme();
  
  if (!context) {
    console.warn('Logo used outside of SidebarProvider');
    return (
      <Box
        component={Link}
        to="/"
        sx={{
          position: 'fixed',
          top: 20,
          left: 40,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          textDecoration: 'none',
          cursor: 'pointer',
          zIndex: 1201,
          '&:hover': {
            opacity: 0.8,
          },
        }}
        className="focus-in-expand-normal"
      >
        <Box
          component="img"
          src={isDarkMode ? "/occ-logo-white.svg" : "/occ-logo.svg"}
          alt="OCC Logo"
          sx={{
            width: 28,
            height: 28,
            filter: isDarkMode ? 'invert(1)' : 'none',
          }}
        />
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
            color: isDarkMode ? '#fff' : '#000',
          }}
        >
          OCC
        </Typography>
      </Box>
    );
  }

  const { sidebarOpen } = context;

  return (
    <Box
      component={Link}
      to="/"
      sx={{
        position: 'fixed',
        top: 20,
        left: 40,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        cursor: 'pointer',
        zIndex: 1201,
        transform: sidebarOpen ? 'translateX(280px)' : 'translateX(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          opacity: 0.8,
        },
      }}
      className="focus-in-expand-normal"
    >
      <Box
        component="img"
        src={isDarkMode ? "/occ-logo-white.svg" : "/occ-logo.svg"}
        alt="OCC Logo"
        sx={{
          width: 28,
          height: 28,
          filter: isDarkMode ? 'invert(1)' : 'none',
        }}
      />
      <Typography
        sx={{
          fontSize: '1.1rem',
          fontWeight: 800,
          letterSpacing: '0.02em',
          fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
          color: isDarkMode ? '#fff' : '#000',
        }}
      >
        OCC
      </Typography>
    </Box>
  );
};

export default Logo;
