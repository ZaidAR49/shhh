// ============================================================
// Shhh — Mock API
// Simulates real async API calls with realistic latency.
// Replace this file's internals (not the function signatures)
// when wiring to a real backend.
// ============================================================

import { MOCK_SECRETS, MOCK_SESSION } from '@/data/mock-data';
import { generateMockId, decodeBlob } from '@/lib/utils';
import { createMockSession, storeSession, clearStoredSession } from '@/lib/session';
import type { Secret, Session, CreateSecretPayload, UpdateSecretPayload } from '@/types';

// In-memory store — initialised from mock-data.ts
let _secrets: Secret[] = [...MOCK_SECRETS];

/** Simulate network latency */
function delay(ms?: number): Promise<void> {
  const latency = ms ?? 200 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, latency));
}

/** Encode fields to a fake encrypted_blob */
function fakeEncrypt(fields: Record<string, string>): string {
  if (typeof btoa !== 'undefined') {
    return btoa(JSON.stringify(fields));
  }
  return Buffer.from(JSON.stringify(fields)).toString('base64');
}

export const mockApi = {
  /** Fetch all secrets for the current user */
  async getSecrets(): Promise<Secret[]> {
    await delay();
    return [..._secrets];
  },

  /** Fetch a single secret by ID */
  async getSecret(id: string): Promise<Secret | null> {
    await delay();
    const secret = _secrets.find((s) => s.id === id) ?? null;
    if (secret && !secret.decrypted_fields) {
      // Simulate decryption on fetch
      return { ...secret, decrypted_fields: decodeBlob(secret.encrypted_blob) };
    }
    return secret;
  },

  /** Create a new secret */
  async createSecret(payload: CreateSecretPayload): Promise<Secret> {
    await delay(400);
    const now = new Date().toISOString();
    const newSecret: Secret = {
      id: generateMockId('sec'),
      user_id: 'usr_00fakeGoogleOAuthId001',
      name: payload.name,
      secret_type: payload.secret_type,
      encrypted_blob: fakeEncrypt(payload.fields),
      decrypted_fields: payload.fields,
      tags: payload.tags ?? [],
      is_favorite: false,
      created_at: now,
      updated_at: now,
    };
    _secrets = [newSecret, ..._secrets];
    return newSecret;
  },

  /** Update an existing secret */
  async updateSecret(id: string, payload: UpdateSecretPayload): Promise<Secret> {
    await delay(350);
    const idx = _secrets.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Secret ${id} not found`);
    const existing = _secrets[idx];
    const updated: Secret = {
      ...existing,
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.tags !== undefined && { tags: payload.tags }),
      ...(payload.is_favorite !== undefined && { is_favorite: payload.is_favorite }),
      ...(payload.fields !== undefined && {
        encrypted_blob: fakeEncrypt(payload.fields),
        decrypted_fields: payload.fields,
      }),
      updated_at: new Date().toISOString(),
    };
    _secrets = _secrets.map((s) => (s.id === id ? updated : s));
    return updated;
  },

  /** Delete a secret by ID */
  async deleteSecret(id: string): Promise<void> {
    await delay(250);
    _secrets = _secrets.filter((s) => s.id !== id);
  },

  /** Search secrets by query string */
  async searchSecrets(query: string): Promise<Secret[]> {
    await delay(150);
    if (!query.trim()) return [..._secrets];
    const q = query.toLowerCase();
    return _secrets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.secret_type.toLowerCase().includes(q) ||
        (s.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
    );
  },

  /** Get the current mock session */
  async getSession(): Promise<Session> {
    await delay(100);
    return MOCK_SESSION;
  },

  /** Simulate Google OAuth unlock flow */
  async mockUnlock(): Promise<Session> {
    await delay(800); // simulate OAuth round-trip
    const session = createMockSession();
    storeSession(session);
    return session;
  },

  /** Lock the vault (clear session) */
  async mockLock(): Promise<void> {
    await delay(150);
    clearStoredSession();
  },

  /** Toggle favorite on a secret */
  async toggleFavorite(id: string): Promise<Secret> {
    const secret = _secrets.find((s) => s.id === id);
    if (!secret) throw new Error(`Secret ${id} not found`);
    return mockApi.updateSecret(id, { is_favorite: !secret.is_favorite });
  },

  /** Reset the in-memory store back to initial mock data */
  async clearVault(): Promise<void> {
    await delay(300);
    _secrets = [];
  },
};
