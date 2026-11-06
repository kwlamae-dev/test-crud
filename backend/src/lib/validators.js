'use strict';

const { HttpError } = require('./http-error');
const { hashPassword } = require('./password');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  return body;
}

function hasAnyKey(body, keys) {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

function parseId(value, label = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

function parseText(value, field, { required = false, max = 255, min = 1 } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new HttpError(400, `"${field}" is required`);
    return '';
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, `"${field}" must be a string`);
  }
  const text = value.trim();
  if (required && text.length === 0) {
    throw new HttpError(400, `"${field}" is required`);
  }
  if (text.length > max) {
    throw new HttpError(400, `"${field}" must be at most ${max} characters`);
  }
  if (text.length > 0 && text.length < min) {
    throw new HttpError(400, `"${field}" must be at least ${min} characters`);
  }
  return text;
}

function parseDecimal(value, field, { min = 0, max = 99999999 } = {}) {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  if (!Number.isFinite(number)) {
    throw new HttpError(400, `"${field}" must be a valid number`);
  }
  if (number < min) {
    throw new HttpError(400, `"${field}" must be greater than or equal to ${min}`);
  }
  if (number > max) {
    throw new HttpError(400, `"${field}" must be less than or equal to ${max}`);
  }
  return Number(number.toFixed(2));
}

function parseInteger(value, field, { min = 0, max = 999999999 } = {}) {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  if (!Number.isInteger(number)) {
    throw new HttpError(400, `"${field}" must be a whole number`);
  }
  if (number < min) {
    throw new HttpError(400, `"${field}" must be greater than or equal to ${min}`);
  }
  if (number > max) {
    throw new HttpError(400, `"${field}" must be less than or equal to ${max}`);
  }
  return number;
}

function parseEmail(value, { required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, '"email" is required');
    return '';
  }
  if (typeof value !== 'string' || !EMAIL_PATTERN.test(value.trim())) {
    throw new HttpError(400, '"email" must be a valid email address');
  }
  return value.trim().toLowerCase();
}

function parsePassword(value, { required = true, min = 6 } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, '"password" is required');
    return null;
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, '"password" must be a string');
  }
  if (value.length < min) {
    throw new HttpError(400, `"password" must be at least ${min} characters`);
  }
  if (value.length > 128) {
    throw new HttpError(400, '"password" must be at most 128 characters');
  }
  return value;
}

function parseDateTime(value, field = 'order_date') {
  if (value === undefined || value === null || value === '') {
    if (field === 'order_date') return new Date().toISOString();
    throw new HttpError(400, `"${field}" is required`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `"${field}" must be a valid date`);
  }
  return date.toISOString();
}

/* ------------------------------- products ------------------------------- */

const PRODUCT_FIELDS = ['pname', 'description', 'price', 'qty'];

function validateProduct(payload, { partial = false, current = null } = {}) {
  const body = assertObject(payload);

  if (partial) {
    if (!hasAnyKey(body, PRODUCT_FIELDS)) {
      throw new HttpError(400, 'No updatable fields were provided');
    }
  }

  const pick = (field, fallback) =>
    body[field] !== undefined ? body[field] : fallback;

  return {
    pname: parseText(pick('pname', current?.pname), 'pname', {
      required: true,
      max: 120,
    }),
    description: parseText(
      pick('description', current?.description ?? ''),
      'description',
      { max: 1000, min: 0 },
    ),
    price: parseDecimal(pick('price', current?.price), 'price', {
      min: 0,
      max: 1000000,
    }),
    qty: parseInteger(pick('qty', current?.qty ?? 0), 'qty', {
      min: 0,
      max: 1000000,
    }),
  };
}

/* --------------------------------- users -------------------------------- */

const USER_FIELDS = ['uname', 'email', 'password'];

function validateUser(payload, { partial = false, current = null } = {}) {
  const body = assertObject(payload);

  if (partial) {
    if (!hasAnyKey(body, USER_FIELDS)) {
      throw new HttpError(400, 'No updatable fields were provided');
    }
  }

  const uname = partial && body.uname === undefined
    ? current.uname
    : parseText(body.uname, 'uname', { required: true, max: 80 });

  const email = partial && body.email === undefined
    ? current.email
    : parseEmail(body.email);

  let passwordHash = current?.password ?? null;
  if (!partial) {
    const plain = parsePassword(body.password, { required: true });
    passwordHash = hashPassword(plain);
  } else if (body.password !== undefined && body.password !== null && body.password !== '') {
    const plain = parsePassword(body.password, { required: false });
    if (plain) passwordHash = hashPassword(plain);
  }

  return { uname, email, password: passwordHash };
}

/* -------------------------------- orders -------------------------------- */

const ORDER_FIELDS = ['uid', 'pid', 'order_date'];

function validateOrder(payload, { partial = false, current = null } = {}) {
  const body = assertObject(payload);

  if (partial) {
    if (!hasAnyKey(body, ORDER_FIELDS)) {
      throw new HttpError(400, 'No updatable fields were provided');
    }
  }

  const uid = partial && body.uid === undefined
    ? current.uid
    : parseId(body.uid, 'uid');

  const pid = partial && body.pid === undefined
    ? current.pid
    : parseId(body.pid, 'pid');

  const orderDate = partial && body.order_date === undefined
    ? current.order_date
    : parseDateTime(body.order_date);

  return { uid, pid, order_date: orderDate };
}

module.exports = {
  parseId,
  parseDateTime,
  validateProduct,
  validateUser,
  validateOrder,
};
