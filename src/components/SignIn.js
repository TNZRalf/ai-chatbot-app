import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField, Divider, Alert } from '@mui/material';
import { Facebook } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const GoogleIcon = () => (
  <Box
    component="img"
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    sx={{ width: 20, height: 20 }}
  />
);

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect to the page they came from or to chat
        const from = location.state?.from?.pathname || '/chat';
        navigate(from);
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (error) {
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/auth/google`;
  };

  const handleFacebookSignIn = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/auth/facebook`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
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
          top: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Logo />
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, mt: 8 }}>
        <Box
          component="form"
          onSubmit={handleSignIn}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 4,
              fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
              fontWeight: 400,
            }}
          >
            Sign in to AI Chat Assistant
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mb: 3,
              height: 48,
              backgroundColor: '#007FFF',
              '&:hover': {
                backgroundColor: '#0066CC',
              },
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Divider sx={{ width: '100%', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{ mb: 2, height: 48 }}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Facebook />}
            onClick={handleFacebookSignIn}
            sx={{ mb: 3, height: 48 }}
          >
            Continue with Facebook
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{ color: '#007FFF', textDecoration: 'none' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SignIn;
