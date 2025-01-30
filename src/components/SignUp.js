import React, { useState } from 'react';
import {
  Box,
  Container,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const { isDarkMode } = useTheme();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) return;

    try {
      await signup(email, password, username);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      await loginWithFacebook();
    } catch (err) {
      setError(err.message);
    }
  };

  const GoogleIcon = () => (
    <Box
      component="img"
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
      alt="Google"
      sx={{ width: 20, height: 20 }}
    />
  );

  const FacebookIcon = () => (
    <Box
      component="img"
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
      alt="Facebook"
      sx={{ width: 20, height: 20 }}
    />
  );

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
            width: 'clamp(1000px, 90%, 1400px)',
            minWidth: '1000px',
            height: 'auto',
            objectFit: 'contain',
            opacity: 1,
            '@media (max-width: 852px)': {
              minWidth: '900px',
              transform: 'translateX(0)',
            },
            '@media (max-width: 441px)': {
              minWidth: '800px',
              transform: 'translateX(0)',
            },
          },
        }}
      >
        <img src="/occ decoration home.png" alt="" />
      </Box>

      {/* Logo at the top */}
      <Box
        sx={{
          position: 'absolute',
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
          py: { xs: 4, sm: 8 },
          mt: { xs: 6, sm: 8 },
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
              letterSpacing: '-0.02em',
            }}
          >
            Create your account
          </Typography>

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
            label="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            label="Email Address"
            name="email"
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
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
            Create Account
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
              onClick={handleGoogleSignup}
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
              onClick={handleFacebookSignup}
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
            Already have an account?{' '}
            <Link
              to="/login"
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
    </Box>
  );
};

export default SignUp;
