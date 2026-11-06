'use strict';

const express = require('express');
const { pool } = require('../db');
const { HttpError } = require('../lib/http-error');
const { parseId, validateProduct } = require('../lib/validators');

const router = express.Router();

const SELECT_PRODUCT =
  'SELECT pid, pname, description, price::double precision AS price, qty FROM products WHERE pid = $1';

async function getProductOrThrow(pid) {
  const { rows } = await pool.query(SELECT_PRODUCT, [pid]);
  if (!rows[0]) throw new HttpError(404, `Product with id ${pid} was not found`);
  return rows[0];
}

router.get('/get_products', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pid, pname, description, price::double precision AS price, qty
     FROM products ORDER BY pid`,
  );
  res.json(rows);
});

router.get('/get_product/:id', async (req, res) => {
  const pid = parseId(req.params.id, 'product id');
  res.json(await getProductOrThrow(pid));
});

router.post('/add_product', async (req, res) => {
  const product = validateProduct(req.body);
  const { rows } = await pool.query(
    `INSERT INTO products (pname, description, price, qty)
     VALUES ($1, $2, $3, $4) RETURNING pid`,
    [product.pname, product.description, product.price, product.qty],
  );
  res.status(201).json(await getProductOrThrow(rows[0].pid));
});

router.put('/update_product/:id', updateProduct);
router.put('/update/:id', updateProduct);

async function updateProduct(req, res) {
  const pid = parseId(req.params.id, 'product id');
  const current = await getProductOrThrow(pid);
  const product = validateProduct(req.body, { partial: true, current });

  await pool.query(
    `UPDATE products
     SET pname = $1, description = $2, price = $3, qty = $4
     WHERE pid = $5`,
    [product.pname, product.description, product.price, product.qty, pid],
  );
  res.json(await getProductOrThrow(pid));
}

router.delete('/delete_product/:id', async (req, res) => {
  const pid = parseId(req.params.id, 'product id');
  const product = await getProductOrThrow(pid);
  await pool.query('DELETE FROM products WHERE pid = $1', [pid]);

  res.json({ message: 'Product deleted successfully', product });
});

module.exports = router;
