import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField, Divider, Alert } from '@mui/material';
import { Facebook } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
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

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await signup(formData);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/auth/google`;
  };

  const handleFacebookSignUp = () => {
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
          onSubmit={handleSubmit}
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
            Create your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: '100%', mb: 3 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Box>
          </Box>

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
            {loading ? 'Creating Account...' : 'Sign Up'}
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
            onClick={handleGoogleSignUp}
            sx={{ mb: 2, height: 48 }}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Facebook />}
            onClick={handleFacebookSignUp}
            sx={{ mb: 3, height: 48 }}
          >
            Continue with Facebook
          </Button>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              to="/signin"
              style={{ color: '#007FFF', textDecoration: 'none' }}
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
