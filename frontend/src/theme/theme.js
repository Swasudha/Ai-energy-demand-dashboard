import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,

      primary: {
        main: isDark ? '#42A5F5' : '#1565C0',
      },

      secondary: {
        main: isDark ? '#26A69A' : '#00897B',
      },

      background: {
        default: isDark ? '#121212' : '#F5F7FA',
        paper: isDark ? '#1E1E1E' : '#FFFFFF',
      },

      text: {
        primary: isDark ? '#F5F5F5' : '#1F2937',
        secondary: isDark ? '#BDBDBD' : '#6B7280',
      },

      success: {
        main: '#2E7D32',
      },

      warning: {
        main: '#ED6C02',
      },

      error: {
        main: '#D32F2F',
      },
    },

    typography: {
      fontFamily: 'Arial, Helvetica, sans-serif',

      h1: {
        fontWeight: 700,
      },

      h2: {
        fontWeight: 700,
      },

      h3: {
        fontWeight: 700,
      },

      h4: {
        fontWeight: 700,
      },

      h5: {
        fontWeight: 600,
      },

      h6: {
        fontWeight: 600,
      },

      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0 2px 10px rgba(0, 0, 0, 0.3)'
              : '0 2px 10px rgba(0, 0, 0, 0.06)',
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },

      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  });
};

export default getTheme;