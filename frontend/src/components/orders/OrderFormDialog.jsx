import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { orderApi } from '../../api/index.js';
import {
  formatCurrency,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from '../../utils/format.js';

function emptyValues() {
  return { uid: '', pid: '', order_date: toDateTimeLocalValue() };
}

function toFormValues(order) {
  if (!order) return emptyValues();
  return {
    uid: String(order.uid),
    pid: String(order.pid),
    order_date: toDateTimeLocalValue(order.order_date),
  };
}

function validate(values) {
  const errors = {};

  if (!values.uid) errors.uid = 'Select a user';
  if (!values.pid) errors.pid = 'Select a product';
  if (!values.order_date) errors.order_date = 'Select an order date';
  else if (Number.isNaN(new Date(values.order_date).getTime())) {
    errors.order_date = 'Enter a valid date and time';
  }

  return errors;
}

export default function OrderFormDialog({ open, order, users, products, onClose, onSaved }) {
  const isEdit = Boolean(order);
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(toFormValues(order));
    setErrors({});
    setServerError('');
  }, [open, order]);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setServerError('');
    try {
      const payload = {
        uid: Number(values.uid),
        pid: Number(values.pid),
        order_date: fromDateTimeLocalValue(values.order_date),
      };
      const saved = isEdit
        ? await orderApi.update(order.oid, payload)
        : await orderApi.create(payload);
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
        <DialogTitle>{isEdit ? 'Edit order' : 'Add order'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              select
              label="User"
              value={values.uid}
              onChange={handleChange('uid')}
              error={Boolean(errors.uid)}
              helperText={errors.uid}
              autoFocus
              required
              fullWidth
            >
              {users.map((user) => (
                <MenuItem key={user.uid} value={String(user.uid)}>
                  {user.uname} (#{user.uid}) · {user.email}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Product"
              value={values.pid}
              onChange={handleChange('pid')}
              error={Boolean(errors.pid)}
              helperText={errors.pid}
              required
              fullWidth
            >
              {products.map((product) => (
                <MenuItem key={product.pid} value={String(product.pid)}>
                  {product.pname} (#{product.pid}) · {formatCurrency(product.price)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Order date and time"
              type="datetime-local"
              value={values.order_date}
              onChange={handleChange('order_date')}
              error={Boolean(errors.order_date)}
              helperText={errors.order_date}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
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
            {isEdit ? 'Save changes' : 'Add order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
