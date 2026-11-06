import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
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
import { Link } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import AppSnackbar from '../components/AppSnackbar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import OrderFormDialog from '../components/orders/OrderFormDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useSnackbar from '../hooks/useSnackbar.js';
import { orderApi, productApi, userApi } from '../api/index.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const EMPTY_FILTERS = { uid: '', pid: '' };

export default function OrdersPage() {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [lookupError, setLookupError] = useState('');
  const [lookupsLoading, setLookupsLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadLookups = useCallback(async () => {
    setLookupsLoading(true);
    setLookupError('');
    try {
      const [userList, productList] = await Promise.all([
        userApi.list(),
        productApi.list(),
      ]);
      setUsers(userList);
      setProducts(productList);
    } catch (error) {
      setLookupError(error.message);
    } finally {
      setLookupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setLoadError('');
      try {
        let data;
        if (filters.uid && filters.pid) {
          data = await orderApi.list({ uid: filters.uid, pid: filters.pid });
        } else if (filters.uid) {
          data = await orderApi.byUser(filters.uid);
        } else if (filters.pid) {
          data = await orderApi.byProduct(filters.pid);
        } else {
          data = await orderApi.list();
        }
        if (!cancelled) setOrders(data);
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [filters, refreshKey]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (first, second) => new Date(second.order_date) - new Date(first.order_date),
      ),
    [orders],
  );

  const hasFilters = Boolean(filters.uid || filters.pid);
  const canCreateOrder = users.length > 0 && products.length > 0;

  const openCreate = () => {
    setEditingOrder(null);
    setFormOpen(true);
  };

  const openEdit = (order) => {
    setEditingOrder(order);
    setFormOpen(true);
  };

  const handleSaved = (saved, isEdit) => {
    setFormOpen(false);
    showSnackbar(isEdit ? 'Order updated successfully' : 'Order added successfully');
    setRefreshKey((current) => current + 1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await orderApi.remove(deleteTarget.oid);
      setOrders((current) => current.filter((item) => item.oid !== deleteTarget.oid));
      setDeleteTarget(null);
      showSnackbar('Order deleted successfully');
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Link customers to products and keep order dates up to date."
        action={
          <Tooltip
            title={
              canCreateOrder || lookupsLoading
                ? ''
                : 'Add at least one user and one product first'
            }
          >
            <span>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
                disabled={!canCreateOrder}
              >
                Add order
              </Button>
            </span>
          </Tooltip>
        }
      />

      {lookupError && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={loadLookups}>
              Retry
            </Button>
          }
        >
          Could not load users or products: {lookupError}
        </Alert>
      )}

      {!lookupsLoading && !lookupError && !canCreateOrder && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Create {users.length === 0 ? 'a user' : 'a product'} before adding an order.{' '}
          {users.length === 0 && (
            <Button component={Link} to="/users" size="small">
              Go to users
            </Button>
          )}
          {products.length === 0 && (
            <Button component={Link} to="/products" size="small">
              Go to products
            </Button>
          )}
        </Alert>
      )}

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
        >
          <TextField
            select
            size="small"
            label="Filter by user"
            value={filters.uid}
            onChange={(event) =>
              setFilters((current) => ({ ...current, uid: event.target.value }))
            }
            sx={{ minWidth: { md: 230 } }}
          >
            <MenuItem value="">All users</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.uid} value={String(user.uid)}>
                {user.uname}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Filter by product"
            value={filters.pid}
            onChange={(event) =>
              setFilters((current) => ({ ...current, pid: event.target.value }))
            }
            sx={{ minWidth: { md: 230 } }}
          >
            <MenuItem value="">All products</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.pid} value={String(product.pid)}>
                {product.pname}
              </MenuItem>
            ))}
          </TextField>

          {hasFilters && (
            <Button
              startIcon={<FilterAltOffRoundedIcon />}
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Clear filters
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />
          <Chip
            size="small"
            label={`${sortedOrders.length} order${sortedOrders.length === 1 ? '' : 's'}`}
            variant="outlined"
          />
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 9 }}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setRefreshKey((current) => current + 1)}
              >
                Retry
              </Button>
            }
            sx={{ m: 2.5 }}
          >
            {loadError}
          </Alert>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptLongRoundedIcon />}
            title={hasFilters ? 'No matching orders' : 'No orders yet'}
            description={
              hasFilters
                ? 'Try clearing the user or product filter.'
                : 'Create an order to connect a customer with a product.'
            }
            action={
              hasFilters ? (
                <Button
                  startIcon={<FilterAltOffRoundedIcon />}
                  onClick={() => setFilters(EMPTY_FILTERS)}
                >
                  Clear filters
                </Button>
              ) : (
                canCreateOrder && (
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={openCreate}
                  >
                    Add order
                  </Button>
                )
              )
            }
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 780 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Order date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.oid} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>#{order.oid}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{order.uname}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{order.pname}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(order.price)} · PID #{order.pid}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(order.order_date)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit order">
                        <IconButton
                          aria-label={`Edit order ${order.oid}`}
                          onClick={() => openEdit(order)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete order">
                        <IconButton
                          aria-label={`Delete order ${order.oid}`}
                          color="error"
                          onClick={() => setDeleteTarget(order)}
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

      <OrderFormDialog
        open={formOpen}
        order={editingOrder}
        users={users}
        products={products}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete order?"
        message={
          deleteTarget
            ? `Order #${deleteTarget.oid} for ${deleteTarget.uname} will be permanently deleted.`
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
