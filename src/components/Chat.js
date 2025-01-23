import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Avatar } from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import Sidebar from './Sidebar';
import { Paperclip } from './Paperclip';
import './Chat.css';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const initialMessageProcessed = useRef(false);

  useEffect(() => {
    if (location.state?.initialMessage && !initialMessageProcessed.current) {
      const newMessage = {
        id: Date.now(),
        text: location.state.initialMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
        attachment: location.state.initialAttachment,
      };
      setMessages([newMessage]);
      initialMessageProcessed.current = true;

      // Show typing indicator
      setIsTyping(true);

      // Simulate AI response with typing delay
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse = {
          id: Date.now() + 1,
          text: 'This is a sample response from the AI. I can help you with various tasks and answer your questions.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 2000);
    }
  }, [location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text) => {
    if (!text.trim() && !attachment) return;

    const newMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      attachment: attachment,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setAttachment(null);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response with typing delay
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = {
        id: Date.now() + 1,
        text: 'This is a sample response from the AI. I can help you with various tasks and answer your questions.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditMessage = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditText(text);
  };

  const handleSaveEdit = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: editText }
        : msg
    ));
    setEditingMessageId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const TypingIndicator = () => (
    <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
      <Avatar
        src="/ai-avatar.png"
        alt="AI"
        sx={{
          width: 36,
          height: 36,
          bgcolor: 'primary.main',
        }}
      />
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          borderTopLeftRadius: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          gap: 1,
        }}
      >
        <Typography sx={{ color: 'text.secondary' }}>
          AI is typing<span className="typing-animation" />
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        position: 'relative',
      }}
    >
      {/* Logo */}
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

      {/* Sidebar */}
      <Sidebar />

      {/* Chat container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { sm: '320px' },
          transition: 'margin-left 0.3s',
          position: 'relative',
          zIndex: 1,
          bgcolor: '#ffffff',
          borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Messages area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            bgcolor: '#f8f9fa',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: 1.5,
                maxWidth: '100%',
              }}
            >
              <Box sx={{ 
                maxWidth: {
                  xs: '85%',
                  sm: '70%',
                  md: '60%'
                },
                width: 'fit-content'
              }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: message.sender === 'user' ? 'rgba(0, 0, 0, 0.8)' : 'background.paper',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    backdropFilter: message.sender === 'user' ? 'blur(10px)' : 'none',
                    border: message.sender === 'user' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    ...(message.sender === 'ai' && {
                      borderTopLeftRadius: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }),
                    ...(message.sender === 'user' && {
                      borderTopRightRadius: 0,
                    }),
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {message.attachment && message.attachment.type?.startsWith('image/') && (
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <Box
                          component="img"
                          src={typeof message.attachment === 'string' ? message.attachment : URL.createObjectURL(message.attachment)}
                          alt={message.attachment.name}
                          sx={{
                            width: '100%',
                            maxHeight: 200,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 1,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: 'white',
                              fontSize: '0.75rem',
                              opacity: 0.9,
                            }}
                          >
                            <AttachFileIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'white' }}>
                              {message.attachment.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    <Typography sx={{ 
                      whiteSpace: 'pre-wrap', 
                      fontSize: '0.95rem',
                      mt: message.attachment?.type?.startsWith('image/') ? 1 : 0
                    }}>
                      {message.text}
                    </Typography>
                    {message.attachment && !message.attachment.type?.startsWith('image/') && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          pl: 2,
                          backgroundColor: message.sender === 'user' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          border: '1px solid',
                          borderColor: message.sender === 'user' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 1,
                          backgroundColor: message.sender === 'user' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <AttachFileIcon sx={{ 
                            fontSize: 20,
                            color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                          }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {message.attachment.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                              display: 'block',
                              mt: 0.2,
                            }}
                          >
                            {(message.attachment.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: 'text.secondary',
                    textAlign: message.sender === 'user' ? 'right' : 'left',
                    fontSize: '0.75rem',
                    opacity: 0.8,
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box
          sx={{
            p: 3,
            backgroundColor: 'transparent',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              position: 'relative',
              maxWidth: '1000px',
              mx: 'auto',
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                    borderRadius: 3,
                    pr: 12,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
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
                  alignItems: 'center',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    color: attachment ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                    '&:hover': {
                      color: 'rgba(0, 0, 0, 0.8)',
                    },
                  }}
                >
                  <Paperclip stroke={attachment ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.54)'} />
                </Box>
                <IconButton
                  type="submit"
                  disabled={!input.trim() && !attachment}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    width: 40,
                    height: 40,
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
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
            {attachment && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  pl: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                {attachment.type.startsWith('image/') ? (
                  <Box
                    component="img"
                    src={URL.createObjectURL(attachment)}
                    alt={attachment.name}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <AttachFileIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {attachment.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setAttachment(null)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                    },
                  }}
                >
                  ×
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
