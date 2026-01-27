import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.FIELD_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('FIELD_ENCRYPTION_KEY environment variable is not set');
  }
  // If key is hex string (64 chars = 32 bytes), convert to buffer
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // Otherwise, derive a key from the string using PBKDF2
  return crypto.pbkdf2Sync(key, 'blackrock-salt', 100000, 32, 'sha256');
}

/**
 * Encrypts a string value using AES-256-GCM
 * Returns format: iv:authTag:encrypted (all base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts a string value encrypted with encrypt()
 */
export function decrypt(encryptedValue: string): string {
  if (!encryptedValue || !encryptedValue.includes(':')) return encryptedValue;

  const parts = encryptedValue.split(':');
  if (parts.length !== 3) return encryptedValue;

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    // Return original value if decryption fails (might be unencrypted legacy data)
    return encryptedValue;
  }
}

/**
 * Checks if a value appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  // Check if parts look like base64
  try {
    Buffer.from(parts[0], 'base64');
    Buffer.from(parts[1], 'base64');
    return true;
  } catch {
    return false;
  }
}

/**
 * Hash a value using SHA-256 (for tokens that don't need to be reversed)
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Compare a value against a hash (timing-safe)
 */
export function compareHash(value: string, hash: string): boolean {
  const valueHash = hashValue(value);
  return crypto.timingSafeEqual(Buffer.from(valueHash), Buffer.from(hash));
}
