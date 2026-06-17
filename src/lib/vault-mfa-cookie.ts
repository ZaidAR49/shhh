import { createHmac } from 'crypto';

const COOKIE_NAME = 'vault_mfa_ok';

/** Create a signed cookie value: userId:expiresAt:HMAC-SHA256 */
export function signVaultMfaCookie(userId: string, expiresAt: number): string {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  const payload = `${userId}:${expiresAt}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

/**
 * Validate the vault MFA cookie value.
 * Returns the userId string if the cookie is valid and not expired, null otherwise.
 */
export function verifyVaultMfaCookie(value: string): string | null {
  if (!value) return null;
  // Format: uuid:timestampMs:hexsig
  const colonIdx1 = value.indexOf(':');
  if (colonIdx1 === -1) return null;
  const colonIdx2 = value.indexOf(':', colonIdx1 + 1);
  if (colonIdx2 === -1) return null;

  const userId = value.slice(0, colonIdx1);
  const expiresAtStr = value.slice(colonIdx1 + 1, colonIdx2);
  const sig = value.slice(colonIdx2 + 1);

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
  if (!userId || !sig) return null;

  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  const expected = createHmac('sha256', secret)
    .update(`${userId}:${expiresAt}`)
    .digest('hex');

  // Constant-time comparison
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? userId : null;
}

export { COOKIE_NAME as VAULT_MFA_COOKIE_NAME };
