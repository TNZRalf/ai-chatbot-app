import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const MessageBubble = ({ message, isAi }) => {
  const theme = useTheme();
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        stagger: 0.02,
      },
    },
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          alignItems: 'flex-start',
        }}
      >
        <Avatar
          sx={{
            bgcolor: isAi ? 'primary.main' : 'secondary.main',
            width: 32,
            height: 32,
          }}
        >
          {isAi ? (
            <SmartToyOutlinedIcon sx={{ fontSize: 20 }} />
          ) : (
            <AccountCircleIcon sx={{ fontSize: 20 }} />
          )}
        </Avatar>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            maxWidth: '80%',
            borderRadius: 2,
            bgcolor: isAi 
              ? (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
              : (theme) => alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
          }}
        >
          <motion.div variants={textVariants} initial="hidden" animate="visible">
            {message.split('').map((char, index) => (
              <motion.span key={index} variants={textVariants}>
                {char}
              </motion.span>
            ))}
          </motion.div>
        </Paper>
      </Box>
    </motion.div>
  );
};

const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAiResponse = async (userMessage) => {
    setIsTyping(true);
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is where you would normally make an API call to your AI service
    const aiResponse = `I received your message: "${userMessage}". This is a simulated response. In a real implementation, this would come from your AI service.`;
    
    setMessages(prev => [...prev, { text: aiResponse, isAi: true }]);
    setIsTyping(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isAi: false }]);
    await simulateAiResponse(userMessage);
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.95),
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Chat header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
          }}
        >
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyOutlinedIcon /> AI Assistant
          </Typography>
        </Box>

        {/* Messages container */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message.text}
                isAi={message.isAi}
              />
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  AI is typing...
                </Typography>
              </motion.div>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.5),
                },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!input.trim() || isTyping}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AiChat;
