import React, { useContext } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  CalendarMonth as CalendarIcon,
  CheckBox as TodoIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { SidebarContext } from '../contexts/SidebarContext';

const Sidebar = () => {
  const context = useContext(SidebarContext);
  
  if (!context) {
    console.warn('Sidebar used outside of SidebarProvider');
    return null;
  }

  const { sidebarOpen, setSidebarOpen } = context;

  const menuItems = [
    { text: 'Calendar AI', icon: <CalendarIcon />, description: 'Smart calendar management powered by AI' },
    { text: 'To-Do List', icon: <TodoIcon />, description: 'Intelligent task organization and tracking' },
    { text: 'Interface Settings', icon: <PaletteIcon />, description: 'Customize your experience' },
    { text: 'Account Settings', icon: <SettingsIcon />, description: 'Manage your account preferences' },
  ];

  return (
    <>
      <IconButton
        onClick={() => setSidebarOpen(true)}
        sx={{
          position: 'fixed',
          left: 40,
          top: 80,
          zIndex: 1200,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          width: 40,
          height: 40,
          opacity: sidebarOpen ? 0 : 1,
          visibility: sidebarOpen ? 'hidden' : 'visible',
          transform: sidebarOpen ? 'translateX(-60px)' : 'translateX(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: '#000',
            transform: sidebarOpen ? 'translateX(-60px)' : 'translateX(0) scale(1.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <MenuIcon sx={{ color: '#fff' }} />
      </IconButton>

      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #000, #333)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em',
            }}
          >
            Features & Services
          </Typography>
          <IconButton 
            onClick={() => setSidebarOpen(false)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronLeftIcon sx={{ color: 'rgba(0, 0, 0, 0.7)' }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3, opacity: 0.1 }} />

        <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                p: 2,
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
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
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  transform: 'translateX(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
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
                  color: '#000',
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
                    color: 'rgba(0, 0, 0, 0.6)',
                    letterSpacing: '0.01em',
                  }}
                />
              </Box>
            </ListItem>
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
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
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
              color: 'rgba(0, 0, 0, 0.6)',
              letterSpacing: '0.02em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            OCC AI Assistant v1.0
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
