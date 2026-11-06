'use strict';

const { randomBytes, scryptSync } = require('node:crypto');

const KEY_LENGTH = 64;

/**
 * Hash a plain-text password using scrypt. The returned value contains the
 * salt so it can be verified later: `scrypt:<salt>:<derivedKey>`.
 */
function hashPassword(plainPassword) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(String(plainPassword), salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

module.exports = { hashPassword };
