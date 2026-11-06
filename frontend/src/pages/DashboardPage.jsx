import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { orderApi, productApi, userApi } from '../api/index.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const STATS_META = [
  {
    key: 'products',
    label: 'Products',
    icon: Inventory2RoundedIcon,
    color: '#4f46e5',
    background: 'rgba(79, 70, 229, 0.1)',
    to: '/products',
  },
  {
    key: 'users',
    label: 'Users',
    icon: PeopleRoundedIcon,
    color: '#0891b2',
    background: 'rgba(8, 145, 178, 0.1)',
    to: '/users',
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: ReceiptLongRoundedIcon,
    color: '#059669',
    background: 'rgba(5, 150, 105, 0.1)',
    to: '/orders',
  },
  {
    key: 'value',
    label: 'Inventory value',
    icon: PaymentsRoundedIcon,
    color: '#d97706',
    background: 'rgba(217, 119, 6, 0.1)',
    to: '/products',
  },
];

export default function DashboardPage() {
  const [data, setData] = useState({ products: [], users: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [products, users, orders] = await Promise.all([
        productApi.list(),
        userApi.list(),
        orderApi.list(),
      ]);
      setData({ products, users, orders });
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const { products, users, orders } = data;

  const inventoryUnits = useMemo(
    () => products.reduce((total, product) => total + product.qty, 0),
    [products],
  );

  const inventoryValue = useMemo(
    () => products.reduce((total, product) => total + product.price * product.qty, 0),
    [products],
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (first, second) => new Date(second.order_date) - new Date(first.order_date),
        )
        .slice(0, 5),
    [orders],
  );

  const lowStock = useMemo(
    () => [...products].filter((product) => product.qty <= 10).sort((a, b) => a.qty - b.qty),
    [products],
  );

  const stats = {
    products: products.length,
    users: users.length,
    orders: orders.length,
    value: formatCurrency(inventoryValue),
  };

  const hints = {
    products: `${inventoryUnits} units on hand`,
    users: 'Registered customers',
    orders: 'Across all customers',
    value: 'Current stock at cost',
  };

  return (
    <>
      <Paper
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          color: '#fff',
          background:
            'linear-gradient(120deg, #3730a3 0%, #4f46e5 55%, #8b5cf6 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            top: -110,
            right: -40,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            bottom: -90,
            right: 160,
          }}
        />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' } }}>
            Welcome back 👋
          </Typography>
          <Typography sx={{ mt: 1, maxWidth: 580, color: 'rgba(255, 255, 255, 0.82)' }}>
            Manage your catalog, customer accounts and orders from one place. Everything
            is stored in a single SQLite database with relational integrity.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{
                bgcolor: '#fff',
                color: 'primary.dark',
                '&:hover': { bgcolor: '#eef2ff' },
              }}
            >
              Manage products
            </Button>
            <Button
              component={Link}
              to="/orders"
              variant="outlined"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              View orders
            </Button>
          </Stack>
        </Box>
      </Paper>

      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadDashboard}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
              mb: 3,
            }}
          >
            {STATS_META.map(({ key, label, icon: Icon, color, background, to }) => (
              <Paper
                key={key}
                component={Link}
                to={to}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'transform 150ms ease, box-shadow 150ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 0.75, fontSize: '1.75rem' }}>
                      {stats[key]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {hints[key]}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: background,
                      color,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.7fr) minmax(0, 1fr)' },
              gap: 2.5,
            }}
          >
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Stack
                direction="row"
                sx={{
                  px: 2.5,
                  py: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h6">Recent orders</Typography>
                  <Typography variant="body2" color="text.secondary">
                    The five latest orders in the system
                  </Typography>
                </Box>
                <Button component={Link} to="/orders" size="small" endIcon={<ArrowForwardRoundedIcon />}>
                  View all
                </Button>
              </Stack>
              <Divider />
              {recentOrders.length === 0 ? (
                <Stack spacing={1} sx={{ alignItems: 'center', py: 6, px: 2 }}>
                  <ReceiptLongRoundedIcon sx={{ color: 'text.disabled', fontSize: 36 }} />
                  <Typography color="text.secondary">No orders yet.</Typography>
                </Stack>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.oid} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              #{order.oid}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.uname}</TableCell>
                          <TableCell>{order.pname}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDateTime(order.order_date)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Stack
                direction="row"
                sx={{
                  px: 2.5,
                  py: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h6">Low stock</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Products with 10 units or fewer
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  icon={<WarningAmberRoundedIcon />}
                  label={lowStock.length}
                  color={lowStock.length > 0 ? 'warning' : 'success'}
                  variant="outlined"
                />
              </Stack>
              <Divider />
              {lowStock.length === 0 ? (
                <Stack spacing={1} sx={{ alignItems: 'center', py: 6, px: 2 }}>
                  <Inventory2RoundedIcon sx={{ color: 'success.main', fontSize: 36 }} />
                  <Typography color="text.secondary">
                    Every product is well stocked.
                  </Typography>
                </Stack>
              ) : (
                <Stack divider={<Divider />} sx={{ px: 2.5 }}>
                  {lowStock.map((product) => (
                    <Stack
                      key={product.pid}
                      direction="row"
                      spacing={2}
                      sx={{
                        py: 1.5,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                          {product.pname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(product.price)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={product.qty === 0 ? 'Out of stock' : `${product.qty} left`}
                        color={product.qty === 0 ? 'error' : 'warning'}
                      />
                    </Stack>
                  ))}
                  <Box sx={{ py: 1.5 }}>
                    <Button component={Link} to="/products" size="small" fullWidth>
                      Restock products
                    </Button>
                  </Box>
                </Stack>
              )}
            </Paper>
          </Box>
        </>
      )}
    </>
  );
}
