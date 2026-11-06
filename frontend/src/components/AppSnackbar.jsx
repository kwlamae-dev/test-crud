import { Alert, Snackbar } from '@mui/material';

export default function AppSnackbar({ snackbar, onClose }) {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={snackbar.severity}
        variant="filled"
        sx={{ minWidth: 300, borderRadius: 2 }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
