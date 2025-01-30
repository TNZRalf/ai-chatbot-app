import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, TextField, IconButton, alpha } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon, AttachFile as AttachFileIcon, Close as CloseIcon } from '@mui/icons-material';
import Logo from './Logo';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Paperclip } from './Paperclip';
import SendIcon from '@mui/icons-material/Send';

const Landing = () => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
      // Use requestAnimationFrame to avoid ResizeObserver loop limit exceeded
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

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  }, []);

  const handleSendMessage = (message) => {
    // Add your logic to handle sending the message
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
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
            borderColor: 'text.primary',
            color: 'text.primary',
            borderRadius: 0,
            px: 4,
            '&:hover': {
              borderColor: 'text.primary',
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
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 0,
            px: 4,
            '&:hover': {
              backgroundColor: 'primary.dark',
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
              color: 'text.primary',
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
                ref={previewRef}
                className="slide-in-top"
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  backgroundColor: (theme) => theme.palette.background.paper,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backdropFilter: 'blur(8px)',
                  border: (theme) => `1px solid ${theme.palette.background.paper}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  maxWidth: 800,
                  mx: 'auto',
                  width: '100%',
                  transition: 'all 0.2s ease-in-out',
                  willChange: 'transform',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.background.paper,
                    border: (theme) => `1px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                  {attachment.type.startsWith('image/') ? (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                        willChange: 'transform',
                      }}
                    >
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt={attachment.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          loading="lazy"
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <AttachFileIcon sx={{ fontSize: 24, color: 'text.primary' }} />
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
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
                        color: 'text.secondary',
                        display: 'block',
                      }}
                    >
                      {(attachment.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setAttachment(null)}
                  sx={{
                    color: 'text.primary',
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 800, mx: 'auto' }}>
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
                    pr: '96px', // Space for icons
                    backgroundColor: 'background.paper',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      backgroundColor: 'background.paper',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
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
                  zIndex: 1,
                  backgroundColor: 'transparent',
                }}
              >
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  className={`${attachment ? 'rotate-scale' : 'bounce-in'}`}
                  sx={{
                    color: attachment ? 'primary.main' : 'text.primary',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => theme.palette.background.paper,
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: (theme) => theme.palette.background.paper,
                    },
                  }}
                >
                  <Paperclip stroke={attachment ? 'primary.main' : 'text.primary'} />
                </Box>
                <IconButton
                  type="submit"
                  disabled={!input.trim() && !attachment}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    width: 40,
                    height: 40,
                    transition: 'all 0.2s ease-in-out',
                    border: (theme) => `1px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: (theme) => theme.palette.action.disabled,
                      color: 'text.disabled',
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
