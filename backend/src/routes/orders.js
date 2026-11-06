'use strict';

const express = require('express');
const { pool } = require('../db');
const { HttpError } = require('../lib/http-error');
const { parseId, validateOrder } = require('../lib/validators');

const router = express.Router();

const SELECT_ORDER = `
  SELECT o.oid, o.uid, o.pid, o.order_date,
         u.uname, u.email,
         p.pname, p.price::double precision AS price
  FROM orders o
  JOIN users u ON u.uid = o.uid
  JOIN products p ON p.pid = o.pid
`;

async function getOrderOrThrow(oid) {
  const { rows } = await pool.query(`${SELECT_ORDER} WHERE o.oid = $1`, [oid]);
  if (!rows[0]) throw new HttpError(404, `Order with id ${oid} was not found`);
  return rows[0];
}

async function assertUserExists(uid) {
  const { rows } = await pool.query('SELECT uid FROM users WHERE uid = $1', [uid]);
  if (!rows[0]) throw new HttpError(400, `User with id ${uid} does not exist`);
}

async function assertProductExists(pid) {
  const { rows } = await pool.query('SELECT pid FROM products WHERE pid = $1', [pid]);
  if (!rows[0]) throw new HttpError(400, `Product with id ${pid} does not exist`);
}

async function listOrders({ uid, pid } = {}) {
  const clauses = [];
  const params = [];
  if (uid !== undefined) {
    params.push(parseId(uid, 'uid'));
    clauses.push(`o.uid = $${params.length}`);
  }
  if (pid !== undefined) {
    params.push(parseId(pid, 'pid'));
    clauses.push(`o.pid = $${params.length}`);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`${SELECT_ORDER}${where} ORDER BY o.oid`, params);
  return rows;
}

router.get('/get_orders', async (req, res) => {
  res.json(await listOrders({ uid: req.query.uid, pid: req.query.pid }));
});

router.get(['/get_orders/user/:uid', '/get_orders/uid/:uid'], async (req, res) => {
  const uid = parseId(req.params.uid, 'uid');
  await assertUserExists(uid);
  res.json(await listOrders({ uid }));
});

router.get(
  ['/get_orders/product/:pid', '/get_orders/pid/:pid'],
  async (req, res) => {
    const pid = parseId(req.params.pid, 'pid');
    await assertProductExists(pid);
    res.json(await listOrders({ pid }));
  },
);

router.get('/get_order/:id', async (req, res) => {
  const oid = parseId(req.params.id, 'order id');
  res.json(await getOrderOrThrow(oid));
});

router.post('/add_order', async (req, res) => {
  const order = validateOrder(req.body);
  await assertUserExists(order.uid);
  await assertProductExists(order.pid);
  const { rows } = await pool.query(
    `INSERT INTO orders (uid, pid, order_date)
     VALUES ($1, $2, $3) RETURNING oid`,
    [order.uid, order.pid, order.order_date],
  );
  res.status(201).json(await getOrderOrThrow(rows[0].oid));
});

router.put('/update_order/:id', async (req, res) => {
  const oid = parseId(req.params.id, 'order id');
  const current = await getOrderOrThrow(oid);
  const order = validateOrder(req.body, { partial: true, current });
  await assertUserExists(order.uid);
  await assertProductExists(order.pid);

  await pool.query(
    'UPDATE orders SET uid = $1, pid = $2, order_date = $3 WHERE oid = $4',
    [order.uid, order.pid, order.order_date, oid],
  );
  res.json(await getOrderOrThrow(oid));
});

router.delete('/delete_order/:id', async (req, res) => {
  const oid = parseId(req.params.id, 'order id');
  const order = await getOrderOrThrow(oid);
  await pool.query('DELETE FROM orders WHERE oid = $1', [oid]);

  res.json({ message: 'Order deleted successfully', order });
});

module.exports = router;
