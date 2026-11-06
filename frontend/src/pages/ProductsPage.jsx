import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import AppSnackbar from '../components/AppSnackbar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProductFormDialog from '../components/products/ProductFormDialog.jsx';
import useSnackbar from '../hooks/useSnackbar.js';
import { productApi } from '../api/index.js';
import { formatCurrency } from '../utils/format.js';

function StockChip({ qty }) {
  if (qty === 0) return <Chip size="small" color="error" label="Out of stock" />;
  if (qty <= 10) return <Chip size="small" color="warning" label={`${qty} · Low stock`} />;
  return <Chip size="small" color="success" label={`${qty} in stock`} />;
}

export default function ProductsPage() {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setProducts(await productApi.list());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.pname.toLowerCase().includes(term) ||
        (product.description ?? '').toLowerCase().includes(term),
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSaved = (saved, isEdit) => {
    setProducts((current) =>
      isEdit
        ? current.map((item) => (item.pid === saved.pid ? saved : item))
        : [...current, saved],
    );
    setFormOpen(false);
    showSnackbar(isEdit ? 'Product updated successfully' : 'Product added successfully');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productApi.remove(deleteTarget.pid);
      setProducts((current) => current.filter((item) => item.pid !== deleteTarget.pid));
      setDeleteTarget(null);
      showSnackbar('Product deleted successfully');
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Create, update and remove items from your catalog."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            Add product
          </Button>
        }
      />

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder="Search products…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{ maxWidth: { sm: 320 }, width: '100%' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredProducts.length} of {products.length} products
          </Typography>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 9 }}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadProducts}>
                Retry
              </Button>
            }
            sx={{ m: 2.5 }}
          >
            {loadError}
          </Alert>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Inventory2RoundedIcon />}
            title="No products yet"
            description="Add your first product to start managing stock and orders."
            action={
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
                Add product
              </Button>
            }
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<SearchRoundedIcon />}
            title="No matching products"
            description="Try a different search term."
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.pid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            bgcolor: 'rgba(79, 70, 229, 0.09)',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Inventory2RoundedIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{product.pname}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            PID #{product.pid}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 340,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      <StockChip qty={product.qty} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit product">
                        <IconButton
                          aria-label={`Edit ${product.pname}`}
                          onClick={() => openEdit(product)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete product">
                        <IconButton
                          aria-label={`Delete ${product.pname}`}
                          color="error"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <ProductFormDialog
        open={formOpen}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={
          deleteTarget
            ? `"${deleteTarget.pname}" will be permanently deleted. Any orders linked to this product will also be deleted.`
            : ''
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <AppSnackbar snackbar={snackbar} onClose={closeSnackbar} />
    </>
  );
}
