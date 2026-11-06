'use strict';

const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, same-origin) are allowed.
      if (
        !origin ||
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(origin) ||
        localDevOrigin.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('This origin is not allowed by CORS'));
    },
  }),
);

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'CRUD Test API',
    docs: 'See backend/README.md for the full endpoint list.',
    endpoints: {
      products: '/api/get_products',
      users: '/api/get_users',
      orders: '/api/get_orders',
      health: '/api/health',
    },
  });
});

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
});

app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body contains invalid JSON' });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'A record with the same unique value already exists',
    });
  }

  if (err.message === 'This origin is not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }

  const status = Number(err.status) || 500;

  if (status >= 500) {
    console.error(err);
  }

  const payload = {
    error: status >= 500 ? 'Internal server error' : err.message,
  };
  if (err.details) payload.details = err.details;

  return res.status(status).json(payload);
});

module.exports = app;
