// ============================================================
// Shhh — TypeScript Types
// Single source of truth for all domain types.
// ============================================================

export type SecretType =
  | 'password'
  | 'visa'
  | 'env_variable'
  | 'api_key'
  | 'license'
  | 'identity'
  | 'bank_account'
  | 'secure_note'
  | 'wifi';

export interface Secret {
  id: string;
  user_id: string;
  name: string;                           // User-defined label for this secret
  secret_type: SecretType;
  encrypted_blob: string;                 // In mock: fake base64-encoded JSON
  decrypted_fields?: Record<string, string>; // Only present after "decryption" in mock
  created_at: string;                     // ISO 8601
  updated_at: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google';
}

export interface Session {
  user: User;
  expires_at: string;   // ISO 8601 — exactly 1 hour after creation
  created_at: string;
}

export type Locale = 'en' | 'ar';
export type Theme = 'light' | 'dark' | 'system';

// Payloads for mock API
export interface CreateSecretPayload {
  secret_type: SecretType;
  name: string;
  fields: Record<string, string>;
  tags?: string[];
}

export interface UpdateSecretPayload {
  name?: string;
  fields?: Record<string, string>;
  tags?: string[];
  is_favorite?: boolean;
}
