import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { createUserProfile } from '../services/firebaseService';
import Logo from './Logo';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Quick validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || password !== confirmPassword) {
      setError('Please fill in all fields correctly');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Create user with email and password
      const { user } = await signup(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`
      });

      // Create user profile
      await createUserProfile(user.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        createdAt: new Date(),
        lastLogin: new Date(),
        photoURL: null,
        preferences: {
          theme: isDarkMode ? 'dark' : 'light',
          notifications: true,
          language: 'en'
        }
      });

      // Show success dialog
      setShowSuccessDialog(true);
      setSuccess('Account created successfully!');
      
      // Wait 2 seconds then navigate to sign in
      setTimeout(() => {
        setShowSuccessDialog(false);
        navigate('/signin', { 
          state: { 
            email: email.trim(),
            message: 'Account created successfully! Please sign in with your email and password.' 
          },
          replace: true // This prevents going back to signup page
        });
      }, 2000);

    } catch (err) {
      console.error('Sign-up error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection');
          break;
        default:
          setError('Failed to create account. ' + (err.message || 'Please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      const { user } = await loginWithGoogle();

      // Create user profile if it doesn't exist
      await createUserProfile(user.uid, {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
        photoURL: user.photoURL,
        preferences: {
          theme: isDarkMode ? 'dark' : 'light',
          notifications: true,
          language: 'en'
        }
      });

      // Navigate directly to home for Google sign-up
      navigate('/home');
    } catch (err) {
      console.error('Google sign-up error:', err);
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-up cancelled. Please try again');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up blocked by browser. Please allow pop-ups for this site');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email using a different sign-in method');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection');
          break;
        default:
          setError('Failed to sign up with Google. ' + (err.message || 'Please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      setLoading(true);
      setError('');
      const { user } = await loginWithFacebook();

      // Create user profile if it doesn't exist
      await createUserProfile(user.uid, {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
        photoURL: user.photoURL,
        preferences: {
          theme: isDarkMode ? 'dark' : 'light',
          notifications: true,
          language: 'en'
        }
      });

      // Navigate directly to home for Facebook sign-up
      navigate('/home');
    } catch (err) {
      console.error('Facebook sign-up error:', err);
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-up cancelled. Please try again');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up blocked by browser. Please allow pop-ups for this site');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with this email using a different sign-in method');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection');
          break;
        default:
          setError('Failed to sign up with Facebook. ' + (err.message || 'Please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
          backdropFilter: (theme) => theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none',
          zIndex: 1,
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
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
          '& img': {
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 1,
          },
        }}
      >
        <img src="/occ decoration home.png" alt="" />
      </Box>

      {/* Logo at the top */}
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 24 },
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Logo />
      </Box>

      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: { xs: '64px', sm: '80px' },
          pb: { xs: '24px', sm: '32px' },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
            backdropFilter: 'blur(16px)',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.08)}`,
            width: '100%',
            maxWidth: 'sm',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 4,
              fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
              fontWeight: 500,
              background: (theme) => `linear-gradient(90deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
          >
            Create Account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                width: '100%',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {location.state?.message && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                width: '100%',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              {location.state.message}
            </Alert>
          )}

          <Box sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </Box>

          <Divider 
            sx={{ 
              width: '100%', 
              my: 3,
              '&::before, &::after': {
                borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              },
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                px: 2,
                fontSize: '0.875rem',
              }}
            >
              or continue with
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignup}
              disabled={loading}
              startIcon={
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  style={{ width: 20, height: 20 }}
                />
              }
              sx={{
                py: 1.5,
                color: '#757575',
                borderColor: '#dadce0',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#dadce0',
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleFacebookSignup}
              disabled={loading}
              startIcon={
                <Box
                  component="img"
                  src={isDarkMode 
                    ? "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
                    : "/facebook-blue.svg"
                  }
                  alt="Facebook"
                  sx={{ width: 20, height: 20 }}
                />
              }
              sx={{
                py: 1.5,
                color: '#1877f2',
                borderColor: '#1877f2',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#1877f2',
                  bgcolor: 'rgba(24, 119, 242, 0.05)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Facebook
            </Button>
          </Box>

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/signin"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                borderBottom: '1px dashed',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 2,
            minWidth: 300,
            backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
            backdropFilter: 'blur(16px)',
          }
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 2,
            }}
          >
            <CheckCircleOutlineIcon
              sx={{
                fontSize: 60,
                color: 'success.main',
                mb: 2,
              }}
            />
            <Typography variant="h6" gutterBottom>
              Account Created Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Redirecting you to sign in...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignUp;
