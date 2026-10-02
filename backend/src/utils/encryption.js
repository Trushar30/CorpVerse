const crypto = require('crypto');
const config = require('../config');

// ─────────────────────────────────────────────────────
// AES-256-GCM ENCRYPTION UTILITY
// Encrypts and decrypts AI provider API keys.
// Sensitive data is encrypted at rest.
// ─────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Derive a safe 32-byte key from ENCRYPTION_KEY or fallback to jwtSecret
const getKey = () => {
  const secret = process.env.ENCRYPTION_KEY || config.jwtSecret || 'corpverse-secure-encryption-key-fallback';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

/**
 * Encrypt plain text using AES-256-GCM
 * @param {string} text
 * @returns {string} iv:tag:ciphertext in hex
 */
const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt hex string back to plaintext
 * @param {string} encryptedText iv:tag:ciphertext
 * @returns {string} plaintext
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const [ivHex, tagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = getKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Mask an API key for safe display (e.g. gsk_••••••••••••3a9f)
 * @param {string} key
 * @returns {string}
 */
const maskKey = (key) => {
  if (!key) return 'Not Configured';
  if (key.length <= 8) return '••••••••';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
};

module.exports = {
  encrypt,
  decrypt,
  maskKey,
};
