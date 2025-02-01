import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Divider,
  Alert,
  alpha,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateUserProfile } from '../services/firebaseService';
import Logo from './Logo';

const GoogleIcon = () => (
  <Box
    component="img"
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    sx={{ width: 20, height: 20 }}
  />
);

const FacebookIcon = () => {
  const { isDarkMode } = useTheme();
  return (
    <Box
      component="img"
      src={isDarkMode 
        ? "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
        : "/facebook-blue.svg"
      }
      alt="Facebook"
      sx={{ width: 20, height: 20 }}
    />
  );
};

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      // Set the email from signup if available
      if (location.state.email) {
        setEmail(location.state.email);
      }
      
      // Clear the location state after using it
      // This prevents the message from showing up again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const { user } = await login(email, password);
      
      // Update user's last login time
      await updateUserProfile(user.uid, {
        lastLogin: new Date(),
        preferences: {
          theme: isDarkMode ? 'dark' : 'light'
        }
      });

      // Redirect to the page they came from or to home
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Sign-in error:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection');
          break;
        default:
          setError('Failed to sign in. ' + (err.message || 'Please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const { user } = await loginWithGoogle();
      
      // Update user profile
      await updateUserProfile(user.uid, {
        lastLogin: new Date(),
        preferences: {
          theme: isDarkMode ? 'dark' : 'light'
        }
      });

      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google sign-in error:', err);
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-in cancelled. Please try again');
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
          setError('Failed to sign in with Google. ' + (err.message || 'Please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const { user } = await loginWithFacebook();
      
      // Update user profile
      await updateUserProfile(user.uid, {
        lastLogin: new Date(),
        preferences: {
          theme: isDarkMode ? 'dark' : 'light'
        }
      });

      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Facebook sign-in error:', err);
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Sign-in cancelled. Please try again');
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
          setError('Failed to sign in with Facebook. ' + (err.message || 'Please try again'));
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
          onSubmit={handleSignIn}
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
              letterSpacing: '-0.02em',
            }}
          >
            Sign in to AI Assistant
          </Typography>

          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              {location.state.message}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            margin="dense"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />

          <TextField
            margin="dense"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1,
              mb: 2,
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
            Sign In
          </Button>

          <Divider 
            sx={{ 
              width: '100%', 
              my: 2,
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

          <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              startIcon={<GoogleIcon />}
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
              onClick={handleFacebookSignIn}
              startIcon={<FacebookIcon />}
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
              mt: 2,
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                borderBottom: '1px dashed',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SignIn;
