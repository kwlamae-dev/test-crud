'use strict';

const express = require('express');
const { pool } = require('../db');
const { HttpError } = require('../lib/http-error');
const { parseId, validateUser } = require('../lib/validators');

const router = express.Router();

const SELECT_USER =
  'SELECT uid, uname, email, password FROM users WHERE uid = $1';

function toPublicUser(user) {
  return { uid: user.uid, uname: user.uname, email: user.email };
}

async function getUserOrThrow(uid) {
  const { rows } = await pool.query(SELECT_USER, [uid]);
  if (!rows[0]) throw new HttpError(404, `User with id ${uid} was not found`);
  return rows[0];
}

async function assertEmailIsAvailable(email, ignoreUid = null) {
  const { rows } = await pool.query(
    `SELECT uid FROM users
     WHERE email = $1 AND ($2::integer IS NULL OR uid <> $2)`,
    [email, ignoreUid],
  );
  if (rows[0]) {
    throw new HttpError(409, 'A user with this email address already exists');
  }
}

router.get('/get_users', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT uid, uname, email FROM users ORDER BY uid',
  );
  res.json(rows);
});

router.get('/get_user/:id', async (req, res) => {
  const uid = parseId(req.params.id, 'user id');
  res.json(toPublicUser(await getUserOrThrow(uid)));
});

router.post('/add_user', async (req, res) => {
  const user = validateUser(req.body);
  await assertEmailIsAvailable(user.email);
  const { rows } = await pool.query(
    `INSERT INTO users (uname, email, password)
     VALUES ($1, $2, $3) RETURNING uid`,
    [user.uname, user.email, user.password],
  );
  res.status(201).json(toPublicUser(await getUserOrThrow(rows[0].uid)));
});

router.put('/update_user/:id', updateUser);

async function updateUser(req, res) {
  const uid = parseId(req.params.id, 'user id');
  const current = await getUserOrThrow(uid);
  const user = validateUser(req.body, { partial: true, current });
  await assertEmailIsAvailable(user.email, uid);

  await pool.query(
    'UPDATE users SET uname = $1, email = $2, password = $3 WHERE uid = $4',
    [user.uname, user.email, user.password, uid],
  );
  res.json(toPublicUser(await getUserOrThrow(uid)));
}

router.delete('/delete_user/:id', async (req, res) => {
  const uid = parseId(req.params.id, 'user id');
  const user = toPublicUser(await getUserOrThrow(uid));
  await pool.query('DELETE FROM users WHERE uid = $1', [uid]);

  res.json({
    message: 'User deleted successfully. Their orders were deleted too.',
    user,
  });
});

module.exports = router;
