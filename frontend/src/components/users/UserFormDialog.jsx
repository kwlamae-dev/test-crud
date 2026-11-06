import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { userApi } from '../../api/index.js';

const EMPTY_VALUES = { uname: '', email: '', password: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toFormValues(user) {
  if (!user) return EMPTY_VALUES;
  return { uname: user.uname, email: user.email, password: '' };
}

function validate(values, isEdit) {
  const errors = {};

  if (!values.uname.trim()) {
    errors.uname = 'Full name is required';
  } else if (values.uname.trim().length > 80) {
    errors.uname = 'Name must be 80 characters or fewer';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!isEdit && !values.password) {
    errors.password = 'Password is required';
  } else if (values.password && values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

export default function UserFormDialog({ open, user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(toFormValues(user));
    setErrors({});
    setServerError('');
    setShowPassword(false);
  }, [open, user]);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, isEdit);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setServerError('');
    try {
      const payload = {
        uname: values.uname.trim(),
        email: values.email.trim(),
      };
      if (values.password) payload.password = values.password;

      const saved = isEdit
        ? await userApi.update(user.uid, payload)
        : await userApi.create(payload);
      onSaved(saved, isEdit);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? 'Edit user' : 'Add user'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Full name"
              value={values.uname}
              onChange={handleChange('uname')}
              error={Boolean(errors.uname)}
              helperText={errors.uname}
              autoFocus
              required
              fullWidth
            />

            <TextField
              label="Email address"
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoComplete="email"
              required
              fullWidth
            />

            <TextField
              label={isEdit ? 'New password (optional)' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange('password')}
              error={Boolean(errors.password)}
              helperText={
                errors.password ||
                (isEdit
                  ? 'Leave blank to keep the current password'
                  : 'At least 6 characters')
              }
              autoComplete="new-password"
              required={!isEdit}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((current) => !current)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffRoundedIcon />
                        ) : (
                          <VisibilityRoundedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />
            }
          >
            {isEdit ? 'Save changes' : 'Add user'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
