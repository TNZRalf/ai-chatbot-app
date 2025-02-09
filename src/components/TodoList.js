import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const TodoList = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Applications Automater
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Coming soon: AI-powered tool to help automate your job applications.
        </Typography>
      </Box>
    </Container>
  );
};

export default TodoList;
