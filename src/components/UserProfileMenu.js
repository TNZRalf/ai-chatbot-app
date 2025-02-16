import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';

const Input = styled('input')({
  display: 'none',
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const UserProfileMenu = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, userProfile, logout, updateUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    console.log('UserProfile in UserProfileMenu:', userProfile);
    if (userProfile) {
      console.log('Setting form data from userProfile:', {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      });
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
      }));
      setPreviewUrl(userProfile.photoURL || '');
    }
  }, [userProfile]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    console.log('Opening dialog with userProfile:', userProfile);
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setPreviewUrl(userProfile.photoURL || '');
    }
    setOpenDialog(true);
    handleClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveSection('profile');
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const validateForm = () => {
    if (activeSection === 'profile') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('First name and last name are required');
        return false;
      }
    } else if (activeSection === 'security') {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.newPassword && !formData.currentPassword) {
        setError('Current password is required to set a new password');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      const formDataToSend = new FormData();
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      
      if (formData.currentPassword && formData.newPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      console.log('Submitting form data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        hasAvatar: !!avatarFile,
        hasPasswordUpdate: !!(formData.currentPassword && formData.newPassword),
      });

      await updateUser(formDataToSend);
      setSuccess(true);
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = userProfile?.displayName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim();

  // Debug log for current state
  console.log('Current state:', {
    userProfile,
    formData,
    displayName,
    previewUrl,
  });

  return (
    <>
      <IconButton 
        onClick={handleClick} 
        sx={{ 
          p: 1,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
            {displayName || 'Profile'}
          </Typography>
          {previewUrl ? (
            <Avatar
              src={previewUrl}
              alt={displayName}
              sx={{ 
                width: 40, 
                height: 40,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            />
          ) : (
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.primary.main,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              {getInitials(displayName)}
            </Avatar>
          )}
        </Box>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenDialog} sx={{ gap: 1 }}>
          <AccountCircleIcon fontSize="small" />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
          <SecurityIcon fontSize="small" />
          Logout
        </MenuItem>
      </Menu>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Profile Settings
          </Typography>
        </DialogTitle>
        <Divider />
        
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={activeSection === 'profile' ? 'contained' : 'outlined'}
              onClick={() => setActiveSection('profile')}
              startIcon={<AccountCircleIcon />}
            >
              Profile
            </Button>
            <Button
              variant={activeSection === 'security' ? 'contained' : 'outlined'}
              onClick={() => setActiveSection('security')}
              startIcon={<SecurityIcon />}
            >
              Security
            </Button>
          </Box>

          {activeSection === 'profile' && (
            <Stack spacing={3} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <input
                  accept="image/*"
                  id="avatar-input"
                  type="file"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-input">
                  <StyledAvatar
                    src={previewUrl}
                    alt={formData.firstName}
                  >
                    {!previewUrl && getInitials(`${formData.firstName} ${formData.lastName}`)}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CloudUploadIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </StyledAvatar>
                </label>
              </Box>

              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                variant="outlined"
                required
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                variant="outlined"
                required
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                disabled
              />
            </Stack>
          )}

          {activeSection === 'security' && (
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                variant="outlined"
                error={formData.newPassword !== formData.confirmPassword}
                helperText={
                  formData.newPassword !== formData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || (
              activeSection === 'security' &&
              formData.newPassword !== formData.confirmPassword
            )}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfileMenu;
