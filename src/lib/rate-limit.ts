// Simple in-memory rate limiter for MFA attempts
// Note: In a multi-instance deployment, a shared store like Redis should be used.

type RateLimitStore = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitStore>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count += 1;
  store.set(key, record);
  return { success: true };
}

// Prevent TOTP token reuse within the validity window (usually 30s, we keep it for 60s to be safe)
const usedTokens = new Map<string, number>();

export function isTokenUsed(userId: string, token: string): boolean {
  const key = `${userId}:${token}`;
  const expiryTime = usedTokens.get(key);
  if (!expiryTime) return false;
  if (Date.now() > expiryTime) {
    usedTokens.delete(key);
    return false;
  }
  return true;
}

export function markTokenUsed(userId: string, token: string) {
  const key = `${userId}:${token}`;
  // Store it for 60s
  usedTokens.set(key, Date.now() + 60 * 1000);
}
