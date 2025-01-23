import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Button, TextField, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import Logo from './Logo';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Paperclip } from './Paperclip';

const Landing = () => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() || attachment) {
      if (user) {
        navigate('/chat', { state: { initialMessage: input, initialAttachment: attachment } });
      } else {
        navigate('/signin', { 
          state: { 
            from: '/chat', 
            initialMessage: input, 
            initialAttachment: attachment 
          } 
        });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && (input.trim() || attachment)) {
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        p: 3,
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
            {attachment && (
              <Box
                className="slide-in-top"
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {attachment.type.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={URL.createObjectURL(attachment)}
                      alt={attachment.name}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        objectFit: 'cover',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  ) : (
                    <AttachFileIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {attachment.name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setAttachment(null)}
                  sx={{
                    color: 'text.secondary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      color: 'text.primary',
                    },
                  }}
                >
                  ×
                </IconButton>
              </Box>
            )}
            <Box sx={{ position: 'relative' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
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
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  className={`${attachment ? 'rotate-scale' : 'bounce-in'}`}
                  sx={{
                    color: attachment ? 'primary.main' : 'rgba(0, 0, 0, 0.54)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  <Paperclip stroke={attachment ? '#1976d2' : 'rgba(0, 0, 0, 0.54)'} />
                </Box>
                <IconButton
                  type="submit"
                  disabled={!input.trim() && !attachment}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: '#000',
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
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;
