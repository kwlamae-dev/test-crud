import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { productApi } from '../../api/index.js';

const EMPTY_VALUES = { pname: '', description: '', price: '', qty: '' };

function toFormValues(product) {
  if (!product) return EMPTY_VALUES;
  return {
    pname: product.pname,
    description: product.description ?? '',
    price: String(product.price),
    qty: String(product.qty),
  };
}

function validate(values) {
  const errors = {};

  if (!values.pname.trim()) {
    errors.pname = 'Product name is required';
  } else if (values.pname.trim().length > 120) {
    errors.pname = 'Product name must be 120 characters or fewer';
  }

  if (values.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer';
  }

  const price = Number(values.price);
  if (values.price.trim() === '' || Number.isNaN(price) || price < 0) {
    errors.price = 'Enter a price of 0 or more';
  }

  const qty = Number(values.qty);
  if (values.qty.trim() === '' || !Number.isInteger(qty) || qty < 0) {
    errors.qty = 'Enter a whole quantity of 0 or more';
  }

  return errors;
}

export default function ProductFormDialog({ open, product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(toFormValues(product));
    setErrors({});
    setServerError('');
  }, [open, product]);

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
        pname: values.pname.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        qty: Number(values.qty),
      };
      const saved = isEdit
        ? await productApi.update(product.pid, payload)
        : await productApi.create(payload);
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
        <DialogTitle>{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Product name"
              value={values.pname}
              onChange={handleChange('pname')}
              error={Boolean(errors.pname)}
              helperText={errors.pname}
              autoFocus
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={values.description}
              onChange={handleChange('description')}
              error={Boolean(errors.description)}
              helperText={errors.description}
              multiline
              minRows={3}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Price (USD)"
                type="number"
                value={values.price}
                onChange={handleChange('price')}
                error={Boolean(errors.price)}
                helperText={errors.price}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                required
                fullWidth
              />
              <TextField
                label="Quantity in stock"
                type="number"
                value={values.qty}
                onChange={handleChange('qty')}
                error={Boolean(errors.qty)}
                helperText={errors.qty}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                required
                fullWidth
              />
            </Stack>
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
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
