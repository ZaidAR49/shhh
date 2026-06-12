// ============================================================
// Shhh — Mock Data
// SINGLE SOURCE OF TRUTH for all Phase 1 fake data.
// Never replace this file with inline data in components.
// ============================================================

import type { Secret, User, Session } from '@/types';

// ── Helper ──────────────────────────────────────────────────
// Simulate encrypted_blob: real arch would AES-GCM encrypt;
// in mock we just base64-encode the JSON so the UI can visually
// signal the encryption contract without implementing it.
function fakeEncrypt(fields: Record<string, string>): string {
  if (typeof btoa !== 'undefined') {
    return btoa(JSON.stringify(fields));
  }
  return Buffer.from(JSON.stringify(fields)).toString('base64');
}

// ── Mock User ────────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'usr_00fakeGoogleOAuthId001',
  name: 'Alex Jordan',
  email: 'alex.jordan@gmail.com',
  image: 'https://lh3.googleusercontent.com/a/fake-avatar',
  provider: 'google',
};

// ── Mock Session ─────────────────────────────────────────────
const SESSION_CREATED = new Date('2026-06-12T13:00:00Z').toISOString();
const SESSION_EXPIRES = new Date('2026-06-12T14:00:00Z').toISOString();

export const MOCK_SESSION: Session = {
  user: MOCK_USER,
  created_at: SESSION_CREATED,
  expires_at: SESSION_EXPIRES,
};

// ── Mock Secrets (≥12, all 9 types covered) ─────────────────
export const MOCK_SECRETS: Secret[] = [
  // ── password (×2) ──────────────────────────────────────
  {
    id: 'sec_pw_001',
    user_id: MOCK_USER.id,
    name: 'GitHub Account',
    secret_type: 'password',
    encrypted_blob: fakeEncrypt({
      site_url: 'https://github.com',
      username: 'alex.jordan',
      password: 'Tr0ub4dor&3!Correct',
      notes: 'Personal dev account. SSH key also stored separately.',
    }),
    decrypted_fields: {
      site_url: 'https://github.com',
      username: 'alex.jordan',
      password: 'Tr0ub4dor&3!Correct',
      notes: 'Personal dev account. SSH key also stored separately.',
    },
    tags: ['dev', 'git'],
    is_favorite: true,
    created_at: '2026-01-10T08:30:00Z',
    updated_at: '2026-03-15T14:22:00Z',
  },
  {
    id: 'sec_pw_002',
    user_id: MOCK_USER.id,
    name: 'حساب نتفليكس',   // Arabic: Netflix Account
    secret_type: 'password',
    encrypted_blob: fakeEncrypt({
      site_url: 'https://netflix.com',
      username: 'alex@gmail.com',
      password: 'N3tfl1x$ecure2026!',
      notes: '',
    }),
    decrypted_fields: {
      site_url: 'https://netflix.com',
      username: 'alex@gmail.com',
      password: 'N3tfl1x$ecure2026!',
      notes: '',
    },
    tags: ['streaming'],
    is_favorite: false,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // ── visa ───────────────────────────────────────────────
  {
    id: 'sec_visa_001',
    user_id: MOCK_USER.id,
    name: 'Visa Platinum Card',
    secret_type: 'visa',
    encrypted_blob: fakeEncrypt({
      card_holder: 'ALEX JORDAN',
      card_number: '4111 1111 1111 1111',
      expiry_date: '09/28',
      cvv: '737',
      billing_address: '42 Nowhere Lane, Springfield, IL 62701',
    }),
    decrypted_fields: {
      card_holder: 'ALEX JORDAN',
      card_number: '4111 1111 1111 1111',
      expiry_date: '09/28',
      cvv: '737',
      billing_address: '42 Nowhere Lane, Springfield, IL 62701',
    },
    tags: ['finance'],
    is_favorite: true,
    created_at: '2026-01-05T09:00:00Z',
    updated_at: '2026-01-05T09:00:00Z',
  },

  // ── env_variable ───────────────────────────────────────
  {
    id: 'sec_env_001',
    user_id: MOCK_USER.id,
    name: 'Stripe API Keys — Production',
    secret_type: 'env_variable',
    encrypted_blob: fakeEncrypt({
      content: 'STRIPE_SECRET_KEY=sk_live_fake_51ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr',
      project: 'shhh-storefront',
      notes: 'Rotate every 90 days. Stored in Vercel env too.',
    }),
    decrypted_fields: {
      content: 'STRIPE_SECRET_KEY=sk_live_fake_51ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr',
      project: 'shhh-storefront',
      notes: 'Rotate every 90 days. Stored in Vercel env too.',
    },
    tags: ['stripe', 'prod', 'payments'],
    is_favorite: false,
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-05-10T09:45:00Z',
  },

  // ── api_key ────────────────────────────────────────────
  {
    id: 'sec_api_001',
    user_id: MOCK_USER.id,
    name: 'OpenAI API Key',
    secret_type: 'api_key',
    encrypted_blob: fakeEncrypt({
      service_name: 'OpenAI',
      api_key: 'sk-fake-abc123XYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      key_alias: 'shhh-dev-key',
      expiry_date: '2027-01-01',
      notes: 'GPT-4o access. Budget capped at $50/month.',
    }),
    decrypted_fields: {
      service_name: 'OpenAI',
      api_key: 'sk-fake-abc123XYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      key_alias: 'shhh-dev-key',
      expiry_date: '2027-01-01',
      notes: 'GPT-4o access. Budget capped at $50/month.',
    },
    tags: ['ai', 'openai'],
    is_favorite: true,
    created_at: '2026-04-01T08:00:00Z',
    updated_at: '2026-04-01T08:00:00Z',
  },

  // ── license ────────────────────────────────────────────
  {
    id: 'sec_lic_001',
    user_id: MOCK_USER.id,
    name: 'JetBrains All Products Pack',
    secret_type: 'license',
    encrypted_blob: fakeEncrypt({
      software_name: 'JetBrains All Products Pack',
      license_key: 'FAKE-JETB-RAIN-S001-LICN-SEKY-ABCD',
      licensed_to: 'Alex Jordan <alex.jordan@gmail.com>',
      purchase_date: '2025-11-15',
      expiry_date: '2026-11-14',
    }),
    decrypted_fields: {
      software_name: 'JetBrains All Products Pack',
      license_key: 'FAKE-JETB-RAIN-S001-LICN-SEKY-ABCD',
      licensed_to: 'Alex Jordan <alex.jordan@gmail.com>',
      purchase_date: '2025-11-15',
      expiry_date: '2026-11-14',
    },
    tags: ['software', 'ide'],
    is_favorite: false,
    created_at: '2025-11-16T10:00:00Z',
    updated_at: '2025-11-16T10:00:00Z',
  },

  // ── identity ───────────────────────────────────────────
  {
    id: 'sec_id_001',
    user_id: MOCK_USER.id,
    name: 'Passport — United Kingdom',
    secret_type: 'identity',
    encrypted_blob: fakeEncrypt({
      document_type: 'passport',
      full_name: 'Alexander Thomas Jordan',
      document_number: '123456789GBR',
      issue_date: '2020-03-10',
      expiry_date: '2030-03-09',
      issuing_country: 'United Kingdom',
    }),
    decrypted_fields: {
      document_type: 'passport',
      full_name: 'Alexander Thomas Jordan',
      document_number: '123456789GBR',
      issue_date: '2020-03-10',
      expiry_date: '2030-03-09',
      issuing_country: 'United Kingdom',
    },
    tags: ['travel', 'id'],
    is_favorite: false,
    created_at: '2020-03-15T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },

  // ── bank_account ───────────────────────────────────────
  {
    id: 'sec_bank_001',
    user_id: MOCK_USER.id,
    name: 'حساب مصرف الراجحي',  // Arabic: Al Rajhi Bank Account
    secret_type: 'bank_account',
    encrypted_blob: fakeEncrypt({
      bank_name: 'Al Rajhi Bank',
      account_holder: 'Alex Jordan',
      account_number: '00001234567890',
      iban: 'SA0000000000000001234567',
      swift_bic: 'RJHISARI',
      currency: 'SAR',
    }),
    decrypted_fields: {
      bank_name: 'Al Rajhi Bank',
      account_holder: 'Alex Jordan',
      account_number: '00001234567890',
      iban: 'SA0000000000000001234567',
      swift_bic: 'RJHISARI',
      currency: 'SAR',
    },
    tags: ['bank', 'saudi'],
    is_favorite: true,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'sec_bank_002',
    user_id: MOCK_USER.id,
    name: 'Barclays Current Account',
    secret_type: 'bank_account',
    encrypted_blob: fakeEncrypt({
      bank_name: 'Barclays',
      account_holder: 'Alex Jordan',
      account_number: '31926819',
      iban: 'GB00FAKE00000000000001',
      swift_bic: 'BARCGB22',
      currency: 'GBP',
    }),
    decrypted_fields: {
      bank_name: 'Barclays',
      account_holder: 'Alex Jordan',
      account_number: '31926819',
      iban: 'GB00FAKE00000000000001',
      swift_bic: 'BARCGB22',
      currency: 'GBP',
    },
    tags: ['bank', 'uk'],
    is_favorite: false,
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },

  // ── secure_note ────────────────────────────────────────
  {
    id: 'sec_note_001',
    user_id: MOCK_USER.id,
    name: 'Recovery Codes — Authenticator',
    secret_type: 'secure_note',
    encrypted_blob: fakeEncrypt({
      title: 'Google Authenticator Recovery Codes',
      content: '7F3K-29MP\n9QXR-L4NT\nBW82-6YDV\nHC5J-3ZMS\nKN71-XQPG\nPT4A-8FCE\nRV9B-2WHL\nUY6D-5NRK',
      tags: 'recovery,2fa,google',
    }),
    decrypted_fields: {
      title: 'Google Authenticator Recovery Codes',
      content: '7F3K-29MP\n9QXR-L4NT\nBW82-6YDV\nHC5J-3ZMS\nKN71-XQPG\nPT4A-8FCE\nRV9B-2WHL\nUY6D-5NRK',
      tags: 'recovery,2fa,google',
    },
    tags: ['2fa', 'recovery'],
    is_favorite: false,
    created_at: '2026-01-20T16:00:00Z',
    updated_at: '2026-01-20T16:00:00Z',
  },

  // ── wifi ───────────────────────────────────────────────
  {
    id: 'sec_wifi_001',
    user_id: MOCK_USER.id,
    name: 'Home WiFi — Main',
    secret_type: 'wifi',
    encrypted_blob: fakeEncrypt({
      network_name: 'JordanHouse_5G',
      password: 'F4m1ly$ecure2026!',
      security_type: 'WPA3',
      notes: 'Router admin: 192.168.1.1 / admin:admin',
    }),
    decrypted_fields: {
      network_name: 'JordanHouse_5G',
      password: 'F4m1ly$ecure2026!',
      security_type: 'WPA3',
      notes: 'Router admin: 192.168.1.1 / admin:admin',
    },
    tags: ['wifi', 'home'],
    is_favorite: false,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'sec_wifi_002',
    user_id: MOCK_USER.id,
    name: 'Office WiFi',
    secret_type: 'wifi',
    encrypted_blob: fakeEncrypt({
      network_name: 'Shhh_Office_Corp',
      password: 'C0rpW1f1#2026',
      security_type: 'WPA2',
      notes: 'IT department manages this. Rotate quarterly.',
    }),
    decrypted_fields: {
      network_name: 'Shhh_Office_Corp',
      password: 'C0rpW1f1#2026',
      security_type: 'WPA2',
      notes: 'IT department manages this. Rotate quarterly.',
    },
    tags: ['wifi', 'work'],
    is_favorite: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sec_env_002',
    user_id: MOCK_USER.id,
    name: 'AWS Access Key — S3 Backups',
    secret_type: 'env_variable',
    encrypted_blob: fakeEncrypt({
      content: 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG',
      project: 'backup-service',
      notes: 'Read-only access to shhh-backups-prod bucket.',
    }),
    decrypted_fields: {
      content: 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG',
      project: 'backup-service',
      notes: 'Read-only access to shhh-backups-prod bucket.',
    },
    tags: ['aws', 'cloud'],
    is_favorite: false,
    created_at: '2026-02-14T10:30:00Z',
    updated_at: '2026-04-01T08:00:00Z',
  },
];
