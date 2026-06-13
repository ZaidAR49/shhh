import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getMasterKey(): Buffer {
  const secret = process.env.MASTER_KEY;
  if (!secret) {
    throw new Error('MASTER_KEY environment variable is not set');
  }

  // Backwards compatibility for old 32-character keys
  if (secret.length === 32) {
    return crypto.createHash('sha256').update(secret).digest();
  }

  // Secure behavior for new 64-character (32-byte) hex keys
  if (secret.length === 64) {
    return Buffer.from(secret, 'hex');
  }

  throw new Error('MASTER_KEY must be a 64-character hex string');
}

/**
 * Encrypts a buffer using a specific 32-byte key.
 * Returns formatted string: iv:authTag:ciphertext
 */
function encryptBuffer(buffer: Buffer, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
}

/**
 * Decrypts a formatted string (iv:authTag:ciphertext) using a specific 32-byte key.
 */
function decryptBuffer(encryptedString: string, key: Buffer): Buffer {
  const parts = encryptedString.split(':');
  if (parts.length !== 3 || !parts.every(p => /^[0-9a-fA-F]*$/.test(p))) {
    throw new Error('Invalid encrypted data format');
  }
  const [ivHex, authTagHex, ciphertextHex] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Implements envelope encryption for a JSON payload.
 */
export function encryptPayload(payload: any): { encryptedData: string; encryptedDek: string } {
  const masterKey = getMasterKey();
  
  // 1. Generate random Data Encryption Key (DEK)
  const dek = crypto.randomBytes(KEY_LENGTH);
  
  // 2. Encrypt the payload with the DEK
  const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
  const encryptedData = encryptBuffer(payloadBuffer, dek);
  
  // 3. Encrypt the DEK with the MASTER_KEY
  const encryptedDek = encryptBuffer(dek, masterKey);
  
  return { encryptedData, encryptedDek };
}

/**
 * Decrypts an envelope-encrypted JSON payload.
 */
export function decryptPayload(encryptedData: string, encryptedDek: string): any {
  const masterKey = getMasterKey();
  
  // 1. Decrypt the DEK using the MASTER_KEY
  const dek = decryptBuffer(encryptedDek, masterKey);
  
  // 2. Decrypt the payload using the DEK
  const payloadBuffer = decryptBuffer(encryptedData, dek);
  
  return JSON.parse(payloadBuffer.toString('utf8'));
}

export function encryptString(text: string): string {
  const masterKey = getMasterKey();
  return encryptBuffer(Buffer.from(text, 'utf8'), masterKey);
}

export function decryptString(encrypted: string): string {
  const masterKey = getMasterKey();
  return decryptBuffer(encrypted, masterKey).toString('utf8');
}
