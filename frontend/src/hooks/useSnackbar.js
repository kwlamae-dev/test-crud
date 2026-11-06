import { useCallback, useState } from 'react';

const INITIAL = { open: false, message: '', severity: 'success' };

export default function useSnackbar() {
  const [snackbar, setSnackbar] = useState(INITIAL);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((current) => ({ ...current, open: false }));
  }, []);

  return { snackbar, showSnackbar, closeSnackbar };
}
