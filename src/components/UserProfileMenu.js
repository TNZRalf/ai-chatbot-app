import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const Input = styled('input')({
  display: 'none',
});

const UserProfileMenu = () => {
  const { user, logout, updateUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.photoURL || '');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    handleClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setAvatarFile(null);
    setPreviewUrl(user?.photoURL || '');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      if (formData.currentPassword && formData.newPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      await updateUser(formDataToSend);
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating profile:', error);
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

  return (
    <>
      <IconButton onClick={handleClick} sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" color="text.primary">
            Welcome, {user?.displayName || `${user?.firstName} ${user?.lastName}`}!
          </Typography>
          {previewUrl ? (
            <Avatar
              src={previewUrl}
              alt={user?.displayName || `${user?.firstName} ${user?.lastName}`}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {getInitials(user?.displayName || `${user?.firstName} ${user?.lastName}`)}
            </Avatar>
          )}
        </Box>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenDialog}>Profile Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Profile Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stack spacing={2} alignItems="center">
              {previewUrl ? (
                <Avatar
                  src={previewUrl}
                  alt={formData.firstName}
                  sx={{ width: 100, height: 100 }}
                />
              ) : (
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                  {getInitials(`${formData.firstName} ${formData.lastName}`)}
                </Avatar>
              )}

              <label htmlFor="avatar-input">
                <Input
                  accept="image/*"
                  id="avatar-input"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <Button variant="outlined" component="span">
                  Change Avatar
                </Button>
              </label>

              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />

              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              !formData.firstName || 
              !formData.lastName || 
              !formData.email ||
              (formData.newPassword !== formData.confirmPassword) ||
              (formData.newPassword && !formData.currentPassword)
            }
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserProfileMenu;
