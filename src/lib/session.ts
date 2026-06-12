// ============================================================
// Shhh — Mock Session State Management
// Wraps localStorage for dev convenience.
// In production this would be a secure httpOnly cookie.
// ============================================================

import { MOCK_SESSION, MOCK_USER } from '@/data/mock-data';
import type { Session } from '@/types';

const SESSION_KEY = 'shhh_mock_session';

/** Read session from localStorage (client-side only). */
export function getStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Persist session to localStorage. */
export function storeSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Remove session from localStorage (lock vault). */
export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/** Create a fresh mock session (1 hour from now). */
export function createMockSession(): Session {
  const now = new Date();
  const expires = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
  return {
    user: MOCK_USER,
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };
}

/** Get minutes remaining in the current session. */
export function getMinutesRemaining(session: Session): number {
  const expires = new Date(session.expires_at).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((expires - now) / 60000));
}

/** Update user's name in the stored session. */
export function updateUserName(name: string): Session | null {
  const session = getStoredSession();
  if (!session) return null;
  session.user.name = name;
  storeSession(session);
  return session;
}

export { MOCK_SESSION };
