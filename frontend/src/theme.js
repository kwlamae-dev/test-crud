import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5', light: '#818cf8', dark: '#3730a3' },
    secondary: { main: '#0ea5e9' },
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    background: { default: '#f5f6fa', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 9, paddingInline: 18 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' },
        root: { borderColor: '#eef2f7' },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },
  },
});

export default theme;
