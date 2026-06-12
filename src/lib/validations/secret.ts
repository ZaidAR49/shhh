import { z } from "zod";

export const secretTypeSchema = z.enum([
  'password',
  'visa',
  'env_variable',
  'api_key',
  'license',
  'identity',
  'bank_account',
  'secure_note',
  'wifi'
]);

export const createSecretSchema = z.object({
  type: secretTypeSchema,
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  encryptedData: z.string().min(1, "Encrypted data is required"),
  encryptedDek: z.string().min(1, "Encrypted DEK is required"),
  isSensitive: z.boolean().optional().default(false),
});

export const updateSecretSchema = createSecretSchema.partial().extend({
  id: z.string().min(1, "Secret ID is required"),
});

// Infer types from schemas to be used in API Handlers and Client functions
export type CreateSecretInput = z.infer<typeof createSecretSchema>;
export type UpdateSecretInput = z.infer<typeof updateSecretSchema>;
