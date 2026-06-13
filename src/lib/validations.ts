// ============================================================
// Shhh — Zod Validation Schemas
// All schemas live here. Never define Zod schemas in components.
// Error messages use i18n keys resolved via t(error.message).
// ============================================================

import { z } from 'zod';

// ── Reusable primitives ──────────────────────────────────────
const req = (max = 500) =>
  z.string().min(1, { message: 'errors.required' }).max(max, { message: 'errors.fieldTooLong' });
const opt = (max = 1000) => z.string().max(max).optional();

// ── Per-type schemas ─────────────────────────────────────────

export const passwordSchema = z.object({
  name:     req(),
  username: req(),
  password: req(),
  notes:    opt(),
});

export const visaSchema = z.object({
  name:            req(),
  card_holder:     z.string().min(2, { message: 'errors.required' }),
  card_number:     z
    .string()
    .regex(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, {
      message: 'errors.invalidCardNumber',
    }),
  expiry_date:     z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'errors.invalidExpiry' }),
  cvv:             z
    .string()
    .regex(/^\d{3,4}$/, { message: 'errors.invalidCvv' }),
  billing_address: opt(),
});

export const envVariableSchema = z.object({
  name:    req(),
  content: z.string().min(1, { message: 'errors.required' }).max(100000, { message: 'errors.fieldTooLong' }),
  notes:   opt(),
});

export const apiKeySchema = z.object({
  name:         req(),
  service_name: req(),
  api_key:      z.string().min(8, { message: 'errors.required' }),
  key_alias:    opt(),
  expiry_date:  opt(),
  notes:        opt(),
});

export const licenseSchema = z.object({
  name:          req(),
  software_name: req(),
  license_key:   req(),
  licensed_to:   opt(),
  purchase_date: opt(),
  expiry_date:   opt(),
});

export const identitySchema = z.object({
  name:            req(),
  document_type:   z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit'], {
    message: 'errors.required',
  }),
  full_name:       z.string().min(2, { message: 'errors.required' }),
  document_number: req(),
  issue_date:      opt(),
  expiry_date:     opt(),
  issuing_country: opt(),
});

export const bankAccountSchema = z.object({
  name:           req(),
  bank_name:      req(),
  account_holder: z.string().min(2, { message: 'errors.required' }),
  account_number: req(),
  iban:           z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/, { message: 'errors.invalidIban' })
    .optional()
    .or(z.literal('')),
  swift_bic:      z
    .string()
    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, { message: 'errors.invalidSwift' })
    .optional()
    .or(z.literal('')),
  currency:       z
    .string()
    .length(3, { message: 'errors.invalidCurrency' })
    .optional()
    .or(z.literal('')),
});

export const secureNoteSchema = z.object({
  name:    req(),
  content: z.string().min(1, { message: 'errors.required' }).max(10000),
});

export const wifiSchema = z.object({
  name:          req(),
  network_name:  req(),
  password:      req(),
  security_type: z.enum(['WPA2', 'WPA3', 'WEP', 'open'], {
    message: 'errors.required',
  }),
  notes:         opt(),
});

// ── Schema map (resolves by secret_type) ─────────────────────
export const SECRET_SCHEMAS = {
  password:     passwordSchema,
  visa:         visaSchema,
  env_variable: envVariableSchema,
  api_key:      apiKeySchema,
  license:      licenseSchema,
  identity:     identitySchema,
  bank_account: bankAccountSchema,
  secure_note:  secureNoteSchema,
  wifi:         wifiSchema,
} as const;

// ── Inferred TypeScript types ─────────────────────────────────
export type PasswordFormData    = z.infer<typeof passwordSchema>;
export type VisaFormData        = z.infer<typeof visaSchema>;
export type EnvVariableFormData = z.infer<typeof envVariableSchema>;
export type ApiKeyFormData      = z.infer<typeof apiKeySchema>;
export type LicenseFormData     = z.infer<typeof licenseSchema>;
export type IdentityFormData    = z.infer<typeof identitySchema>;
export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
export type SecureNoteFormData  = z.infer<typeof secureNoteSchema>;
export type WifiFormData        = z.infer<typeof wifiSchema>;
