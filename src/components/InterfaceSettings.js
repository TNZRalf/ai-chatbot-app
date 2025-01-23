import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  IconButton,
  Button,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  TextFields as TextFieldsIcon,
  Animation as AnimationIcon,
  Contrast as ContrastIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import Sidebar from './Sidebar';

const InterfaceSettings = () => {
  const {
    isDarkMode,
    setIsDarkMode,
    fontSize,
    setFontSize,
    animationsEnabled,
    setAnimationsEnabled,
    contrastMode,
    setContrastMode,
  } = useTheme();

  const handleReset = () => {
    setIsDarkMode(false);
    setFontSize('medium');
    setAnimationsEnabled(true);
    setContrastMode('normal');
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('fontSize', JSON.stringify(fontSize));
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
    localStorage.setItem('contrastMode', JSON.stringify(contrastMode));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Sidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: isDarkMode ? '#121212' : '#ffffff',
          color: isDarkMode ? '#fff' : '#000',
          transition: 'all 0.3s ease',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Logo and Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 2,
          }}
        >
          <Logo />
        </Box>

        <Paper
          elevation={0}
          sx={{
            maxWidth: 800,
            mx: 'auto',
            mt: 10,
            p: 4,
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            color: isDarkMode ? '#fff' : '#000',
            transition: 'all 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 500, color: isDarkMode ? '#fff' : '#000' }}>
              Interface Settings
            </Typography>
            <Box>
              <IconButton 
                onClick={handleReset} 
                title="Reset to defaults" 
                sx={{ 
                  mr: 1,
                  color: isDarkMode ? '#fff' : '#000',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <UndoIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  backgroundColor: isDarkMode ? '#fff' : '#000',
                  color: isDarkMode ? '#000' : '#fff',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Dark Mode */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {isDarkMode ? (
                  <DarkModeIcon sx={{ mr: 1, color: '#fff' }} />
                ) : (
                  <LightModeIcon sx={{ mr: 1 }} />
                )}
                <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Appearance
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={(e) => setIsDarkMode(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: isDarkMode ? '#fff' : '#000',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: isDarkMode ? '#fff' : '#000',
                      },
                    }}
                  />
                }
                label="Dark Mode"
                sx={{ color: isDarkMode ? '#fff' : '#000' }}
              />
            </Box>

            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

            {/* Font Size */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextFieldsIcon sx={{ mr: 1, color: isDarkMode ? '#fff' : '#000' }} />
                <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Text Size
                </Typography>
              </Box>
              <Select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                fullWidth
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  color: isDarkMode ? '#fff' : '#000',
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '& .MuiMenuItem-root': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#121212' : '#fff',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#fff' : '#000',
                      },
                    },
                  },
                }}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </Box>

            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

            {/* Animations */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnimationIcon sx={{ mr: 1, color: isDarkMode ? '#fff' : '#000' }} />
                <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Animations
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={animationsEnabled}
                    onChange={(e) => setAnimationsEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: isDarkMode ? '#fff' : '#000',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: isDarkMode ? '#fff' : '#000',
                      },
                    }}
                  />
                }
                label="Enable Animations"
                sx={{ color: isDarkMode ? '#fff' : '#000' }}
              />
            </Box>

            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

            {/* Contrast Mode */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ContrastIcon sx={{ mr: 1, color: isDarkMode ? '#fff' : '#000' }} />
                <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Contrast
                </Typography>
              </Box>
              <Select
                value={contrastMode}
                onChange={(e) => setContrastMode(e.target.value)}
                fullWidth
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  color: isDarkMode ? '#fff' : '#000',
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#121212' : '#fff',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#fff' : '#000',
                      },
                    },
                  },
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High Contrast</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </Box>
          </Box>

          <Box 
            sx={{ 
              mt: 4, 
              p: 2, 
              backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)', 
              borderRadius: 1,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            }}
          >
            <Typography variant="body2">
              These settings are automatically saved and will be remembered the next time you visit.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default InterfaceSettings;
