import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme as useMuiTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon, AttachFile as AttachFileIcon, Close as CloseIcon } from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import Sidebar from './Sidebar';
import { Paperclip } from './Paperclip';

const Input = styled('input')({
  display: 'none',
});

const Home = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null
  });
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const usernameCheckTimeout = useRef(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Reset profile data when user changes
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }));
    }
  }, [user]);

  const checkUsername = async (username) => {
    if (!username || username === user?.username) {
      setUsernameError('');
      return;
    }

    try {
      const response = await fetch(`/api/auth/check-username/${encodeURIComponent(username)}`);
      if (!response.ok) throw new Error('Failed to check username');
      
      const data = await response.json();
      if (!data.available) {
        setUsernameError('This username is already taken');
      } else {
        setUsernameError('');
      }
    } catch (error) {
      console.error('Failed to check username:', error);
      setUsernameError('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'username') {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
      usernameCheckTimeout.current = setTimeout(() => {
        checkUsername(value);
      }, 500);
    }
  };

  const handleUpdateProfile = async () => {
    setError('');
    setOpenConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    setOpenConfirmDialog(false);

    if (usernameError) {
      setError('Please choose a different username');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      
      if (profileData.currentPassword && profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        formData.append('currentPassword', profileData.currentPassword);
        formData.append('newPassword', profileData.newPassword);
      }

      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar);
      }

      await updateUser(formData);
      setSnackbarMessage('Profile updated successfully!');
      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Cleanup preview URL when attachment changes
  useEffect(() => {
    if (attachment && attachment.type.startsWith('image/')) {
      const url = URL.createObjectURL(attachment);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return () => setPreviewUrl(null);
  }, [attachment]);

  // Handle resize with debounce
  useEffect(() => {
    if (!previewRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
      });
    });

    resizeObserver.observe(previewRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() || attachment) {
      // Process the input and attachment here
      console.log('Processing input:', input);
      console.log('Processing attachment:', attachment);
      // Clear the input and attachment
      setInput('');
      setAttachment(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && (input.trim() || attachment)) {
      handleSubmit(e);
    }
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setProfileData({
      ...profileData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        await updateUser(formData);
        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        const avatars = document.querySelectorAll('#user-avatar');
        avatars.forEach(avatar => {
          avatar.src = previewUrl;
        });
      } catch (error) {
        console.error('Failed to update avatar:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
      : '?';
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#121212' : '#f8f9fa',
        p: 3,
        color: isDarkMode ? '#fff' : '#000',
        transition: 'all 0.3s ease',
      }}
    >
      <Sidebar />
      {/* Decorative background shape */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <img src="/occ decoration home.png" alt="" />
      </Box>
      
      {/* Logo and User Profile */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          zIndex: 2,
        }}
      >
        <Typography variant="body1" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
          Welcome, {user?.firstName} {user?.lastName}!
        </Typography>
        <IconButton onClick={handleMenuClick}>
          <Avatar
            src={user?.avatarUrl}
            alt={user?.firstName}
            id="user-avatar"
            sx={{
              width: 40,
              height: 40,
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#000',
              color: isDarkMode ? '#fff' : '#fff',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#333',
              },
            }}
          >
            {!user?.avatarUrl && getInitials(user?.firstName)}
          </Avatar>
        </IconButton>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 40,
          zIndex: 2,
        }}
      >
        <Logo />
      </Box>
      
      <Container 
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 4, md: 6 },
          mt: -8,
          ml: { sm: '320px' },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: { sm: `calc(100% - 320px)` },
          color: isDarkMode ? '#fff' : '#000',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              color: isDarkMode ? '#fff' : '#000000',
              mb: 2,
              position: 'relative',
              zIndex: 1,
              fontSize: {
                xs: '40px',
                sm: '60px',
                md: '80px',
              },
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Your Personal AI Assistant
          </Typography>

          <Typography
            variant="h2"
            sx={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666',
              mb: 6,
              maxWidth: '600px',
              fontSize: {
                xs: '18px',
                sm: '20px',
                md: '24px',
              },
              fontWeight: 300,
              lineHeight: 1.4,
            }}
          >
            Ask me anything, and I'll help you find the answers you need.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              maxWidth: '600px',
              position: 'relative',
              mt: 0,
            }}
          >
            <TextField
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... 'What's the meaning of life?' 🤔"
              variant="outlined"
              multiline
              maxRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  pr: '96px', // Space for icons
                  backgroundColor: isDarkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(55, 55, 55, 0.95)' : 'rgba(255, 255, 255, 1)',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: isDarkMode ? 'rgba(55, 55, 55, 0.95)' : 'rgba(255, 255, 255, 1)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                  },
                  '& textarea': {
                    padding: '16px',
                    fontSize: '1.1rem',
                    '&::placeholder': {
                      opacity: 0.7,
                      fontStyle: 'italic',
                    },
                  },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                zIndex: 1,
              }}
            >
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  color: isDarkMode ? '#90caf9' : '#1976d2',
                  backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.12)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                <AttachFileIcon 
                  sx={{ 
                    fontSize: 20,
                    transform: 'rotate(45deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </IconButton>

              <IconButton
                onClick={handleSubmit}
                disabled={!input.trim() && !attachment}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  color: isDarkMode ? '#fff' : '#fff',
                  backgroundColor: isDarkMode ? '#90caf9' : '#1976d2',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#82b7e3' : '#1565c0',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.12)',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            {attachment && (
              <Box
                ref={previewRef}
                sx={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  right: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                  maxWidth: '300px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.12)',
                    }}
                  >
                    <Paperclip />
                  </Box>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#90caf9' : '#1976d2',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {attachment.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      display: 'block',
                    }}
                  >
                    {(attachment.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setAttachment(null)}
                  sx={{
                    width: 24,
                    height: 24,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      color: isDarkMode ? '#fff' : '#000',
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </Box>
        </Box>
      </Container>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenDialog}>Edit Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* Success message under user icon */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'absolute',
          top: '80px', // Position it below the user icon
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Profile Update
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update your profile with these changes?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUpdate}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileData.avatar ? URL.createObjectURL(profileData.avatar) : user?.avatarUrl}
                  alt={user?.firstName}
                  id="user-avatar"
                  sx={{ width: 100, height: 100 }}
                >
                  {!user?.avatarUrl && !profileData.avatar && getInitials(user?.firstName)}
                </Avatar>
                <label htmlFor="icon-button-file">
                  <Input
                    accept="image/*"
                    id="icon-button-file"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      right: -10,
                      bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'background.paper',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'background.paper',
                      },
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={profileData.firstName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={profileData.lastName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={profileData.currentPassword}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={profileData.newPassword}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={profileData.confirmPassword}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={loading || !!usernameError}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
