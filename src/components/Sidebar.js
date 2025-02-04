import React, { useContext, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  List,
  CssBaseline,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarIcon,
  CheckBox as TodoIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { SidebarContext } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const context = useContext(SidebarContext);
  const { isDarkMode } = useTheme();
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600 && context.sidebarOpen) {
        context.setSidebarOpen(false);
      }
    };

    // Debounce resize handler
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [context.sidebarOpen, context.setSidebarOpen]);

  if (!context) {
    console.warn('Sidebar used outside of SidebarProvider');
    return null;
  }

  const { sidebarOpen, setSidebarOpen } = context;

  const menuItems = [
    { text: 'CV/Resume', icon: <CalendarIcon />, description: 'add / edit your resume', path: '/resume-parser' },
    { text: 'To-Do List', icon: <TodoIcon />, description: 'Intelligent task organization and tracking',path: '/to-do-list'},
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      description: 'Customize your experience',
      path: '/settings/interface'
    },
  ];

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="toggle sidebar"
        onClick={() => setSidebarOpen(true)}
        sx={{
          position: 'fixed',
          left: 40,
          top: 80,
          zIndex: 1200,
          color: isDarkMode ? '#fff' : '#000',
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <MenuIcon sx={{ color: isDarkMode ? '#fff' : '#000' }} />
      </IconButton>

      <MuiDrawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            background: isDarkMode ? '#1e1e1e' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 192, 203, 0.05) 0%, rgba(128, 0, 128, 0.05) 50%, rgba(0, 128, 128, 0.05) 100%)',
              zIndex: -1,
            },
          },
        }}
      >
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
              fontWeight: 600,
              background: isDarkMode ? 'linear-gradient(45deg, #fff, #ccc)' : 'linear-gradient(45deg, #000, #333)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: isDarkMode ? 'transparent' : 'transparent',
              letterSpacing: '0.02em',
            }}
          >
            Features & Services
          </Typography>
          <IconButton 
            onClick={() => setSidebarOpen(false)}
            sx={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronLeftIcon sx={{ color: isDarkMode ? '#fff' : '#000' }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3, opacity: 0.1 }} />

        <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItemButton
                component={item.path ? Link : 'div'}
                to={item.path}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  background: isDarkMode ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255, 192, 203, 0.05) 0%, rgba(128, 0, 128, 0.05) 50%, rgba(0, 128, 128, 0.05) 100%)',
                    zIndex: -1,
                  },
                  '&:hover': {
                    background: isDarkMode ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                    transform: 'translateX(4px)',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                    '&::before': {
                      opacity: 0.8,
                    },
                  },
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isDarkMode ? '#fff' : '#000',
                    opacity: 0.7,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Box>
                  <ListItemText
                    primary={item.text}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
                      fontWeight: 600,
                      fontSize: '1rem',
                      letterSpacing: '0.02em',
                    }}
                    secondaryTypographyProps={{
                      fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
                      fontSize: '0.75rem',
                      color: isDarkMode ? '#fff' : '#000',
                      opacity: 0.6,
                      letterSpacing: '0.01em',
                    }}
                  />
                </Box>
              </ListItemButton>
            </React.Fragment>
          ))}
        </List>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            background: isDarkMode ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 192, 203, 0.05) 0%, rgba(128, 0, 128, 0.05) 50%, rgba(0, 128, 128, 0.05) 100%)',
              zIndex: -1,
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
              color: isDarkMode ? '#fff' : '#000',
              opacity: 0.6,
              letterSpacing: '0.02em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            OCC AI Assistant v1.0
          </Typography>
        </Box>
      </MuiDrawer>
    </>
  );
};

export default Sidebar;
