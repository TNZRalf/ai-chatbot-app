import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Avatar, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { User } from 'firebase/auth';

interface Message {
  id: string;
  text: string;
  sender: string;
  displayName: string;
  photoURL?: string;
  timestamp: Date;
  attachmentUrl?: string;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string, attachment: File | null) => void;
  user: User;
  isDarkMode: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, user, isDarkMode }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if ((text.trim() || attachment) && onSendMessage) {
      onSendMessage(text, attachment);
      setInput('');
      setAttachment(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: isDarkMode ? '#121212' : '#f5f5f5',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 2,
              alignSelf: message.sender === user.uid ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              [theme.breakpoints.down('sm')]: {
                maxWidth: '85%',
              },
            }}
          >
            {message.sender !== user.uid && (
              <Avatar
                src={message.photoURL || undefined}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDarkMode ? '#2c2c2c' : '#e0e0e0',
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {!message.photoURL && getInitials(message.displayName || 'User')}
              </Avatar>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {message.sender !== user.uid && (
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    ml: 1,
                  }}
                >
                  {message.displayName}
                </Typography>
              )}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: message.sender === user.uid
                    ? (isDarkMode ? '#2c2c2c' : '#1976d2')
                    : (isDarkMode ? '#1e1e1e' : '#fff'),
                  color: message.sender === user.uid
                    ? (isDarkMode ? '#fff' : '#fff')
                    : (isDarkMode ? '#fff' : '#000'),
                  border: '1px solid',
                  borderColor: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : (message.sender === user.uid ? 'transparent' : 'rgba(0, 0, 0, 0.1)'),
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  boxShadow: isDarkMode 
                    ? 'none'
                    : (message.sender === user.uid 
                      ? '0 2px 8px rgba(25, 118, 210, 0.15)'
                      : '0 2px 8px rgba(0, 0, 0, 0.05)'),
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.text}
                </Typography>
              </Paper>
              <Typography
                variant="caption"
                sx={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  alignSelf: message.sender === user.uid ? 'flex-end' : 'flex-start',
                  mr: message.sender === user.uid ? 1 : 0,
                  ml: message.sender === user.uid ? 0 : 1,
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            {message.sender === user.uid && (
              <Avatar
                src={user.photoURL || undefined}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDarkMode ? '#2c2c2c' : '#1976d2',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {!user.photoURL && getInitials(user.displayName || 'User')}
              </Avatar>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
          borderTop: '1px solid',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '1200px',
            mx: 'auto',
            display: 'flex',
            gap: 1.5,
          }}
        >
          {attachment && (
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: '8px 12px',
                borderRadius: '12px',
                bgcolor: isDarkMode ? '#2c2c2c' : '#fff',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              {attachment.type?.startsWith('image/') ? (
                <Box
                  component="img"
                  src={URL.createObjectURL(attachment)}
                  alt={attachment.name}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                  }}
                >
                  <AttachFileIcon sx={{ color: isDarkMode ? '#fff' : '#000' }} />
                </Box>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkMode ? '#fff' : '#000',
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
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {(attachment.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setAttachment(null)}
                sx={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Paper>
          )}

          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? '#2c2c2c' : '#f5f5f5',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
              },
              '& .MuiInputBase-input': {
                color: isDarkMode ? '#fff' : '#000',
                padding: '12px 14px',
                '&::placeholder': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  opacity: 1,
                },
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: 44,
                height: 44,
                bgcolor: isDarkMode ? '#2c2c2c' : '#f5f5f5',
                '&:hover': {
                  bgcolor: isDarkMode ? '#363636' : '#e0e0e0',
                },
              }}
            >
              <AttachFileIcon sx={{ 
                fontSize: 20,
                color: isDarkMode ? '#fff' : '#000',
              }} />
            </IconButton>
            <IconButton
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() && !attachment}
              sx={{
                width: 44,
                height: 44,
                bgcolor: isDarkMode ? '#2c2c2c' : '#1976d2',
                color: '#fff',
                '&:hover': {
                  bgcolor: isDarkMode ? '#363636' : '#1565c0',
                },
                '&.Mui-disabled': {
                  bgcolor: isDarkMode ? '#1e1e1e' : '#e0e0e0',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
