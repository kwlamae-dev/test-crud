import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  confirmColor = 'error',
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
