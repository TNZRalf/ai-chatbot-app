import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '80px',
      fontWeight: 400,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
      '@media (max-width: 852px)': {
        fontSize: '60px',
      },
      '@media (max-width: 441px)': {
        fontSize: '40px',
      },
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Telegraf", "Helvetica", "Arial", sans-serif',
    },
  },
});

export default theme;
