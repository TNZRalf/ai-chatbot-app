import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [input, setInput] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      navigate('/chat', { state: { initialMessage: input } });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      handleSubmit(e);
    }
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
          right: 40,
          display: 'flex',
          gap: 3,
          zIndex: 2,
        }}
      >
        <Button
          component={Link}
          to="/signin"
          variant="outlined"
          sx={{
            borderColor: '#000',
            color: '#000',
            borderRadius: 0,
            px: 4,
            '&:hover': {
              borderColor: '#000',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          Sign In
        </Button>
        <Button
          component={Link}
          to="/signup"
          variant="contained"
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: 0,
            px: 4,
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          Sign Up
        </Button>
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
              color: '#000000',
              mb: { xs: 3, md: 4 },
              position: 'relative',
              zIndex: 1,
            }}
          >
            Hi, how can I help you today?
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              maxWidth: '600px',
              mx: 'auto',
              position: 'relative',
              mt: 4,
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
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                  borderRadius: 3,
                  pr: 6,
                  transition: 'all 0.3s ease-in-out',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                  },
                  '& textarea': {
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
                    '&::placeholder': {
                      opacity: 0.7,
                      fontStyle: 'italic',
                    },
                  },
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={!input.trim()}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                width: 40,
                height: 40,
                transition: 'all 0.3s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: '#000',
                  transform: 'translateY(-50%) scale(1.05)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
