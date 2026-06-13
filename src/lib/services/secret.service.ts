import { db } from '@/db';
import { secrets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { encryptPayload, decryptPayload } from '../helpers/crypto';

// Re-export type for convenience
import type { SecretType } from '../secret-types';

export class SecretService {
  /**
   * Retrieves all secrets for a user, with their payloads decrypted.
   */
  static async findAllByUserId(userId: string) {
    const userSecrets = await db.query.secrets.findMany({
      where: (secrets, { eq }) => eq(secrets.userId, userId),
      orderBy: (secrets, { desc }) => [desc(secrets.updatedAt)],
    });

    return userSecrets.map(secret => {
      let data = {};
      try {
        data = decryptPayload(secret.encryptedData, secret.encryptedDek);
      } catch (e) {
        console.error(`Failed to decrypt secret ${secret.id}`, e);
        data = { error: 'Failed to decrypt data' };
      }
      return {
        ...secret,
        data,
      };
    });
  }

  /**
   * Retrieves a single secret by ID, ensuring it belongs to the user, with payload decrypted.
   */
  static async findById(userId: string, secretId: string) {
    const secret = await db.query.secrets.findFirst({
      where: (secrets, { eq, and }) => and(eq(secrets.id, secretId), eq(secrets.userId, userId)),
    });

    if (!secret) return null;

    let data = {};
    try {
      data = decryptPayload(secret.encryptedData, secret.encryptedDek);
    } catch (e) {
      console.error(`Failed to decrypt secret ${secret.id}`, e);
      data = { error: 'Failed to decrypt data' };
    }

    return {
      ...secret,
      data,
    };
  }

  /**
   * Creates a new secret, encrypting the data payload using envelope encryption.
   */
  static async createSecret(userId: string, type: SecretType, title: string, data: any, isSensitive: boolean = false) {
    const { encryptedData, encryptedDek } = encryptPayload(data);

    const newSecret = await db.insert(secrets)
      .values({
        userId,
        type,
        title,
        encryptedData,
        encryptedDek,
        isSensitive,
      })
      .returning();

    return {
      ...newSecret[0],
      data,
    };
  }

  /**
   * Updates an existing secret, re-encrypting the data payload.
   */
  static async updateSecret(userId: string, secretId: string, title: string, data: any, isSensitive: boolean = false) {
    const { encryptedData, encryptedDek } = encryptPayload(data);

    const updatedSecret = await db.update(secrets)
      .set({
        title,
        encryptedData,
        encryptedDek,
        isSensitive,
        updatedAt: new Date(),
      })
      .where(and(eq(secrets.id, secretId), eq(secrets.userId, userId)))
      .returning();

    if (!updatedSecret.length) {
      return null;
    }

    return {
      ...updatedSecret[0],
      data,
    };
  }

  /**
   * Deletes a secret.
   */
  static async deleteSecret(userId: string, secretId: string) {
    const deletedSecret = await db.delete(secrets)
      .where(and(eq(secrets.id, secretId), eq(secrets.userId, userId)))
      .returning();
      
    return deletedSecret.length > 0;
  }

  /**
   * Toggles the favorite status of a secret.
   */
  static async toggleFavorite(userId: string, secretId: string) {
    const secret = await db.query.secrets.findFirst({
      where: (secrets, { eq, and }) => and(eq(secrets.id, secretId), eq(secrets.userId, userId)),
    });
    
    if (!secret) return null;

    const updatedSecret = await db.update(secrets)
      .set({ isFavorite: !secret.isFavorite, updatedAt: new Date() })
      .where(and(eq(secrets.id, secretId), eq(secrets.userId, userId)))
      .returning();

    if (!updatedSecret.length) return null;

    let data = {};
    try {
      data = decryptPayload(updatedSecret[0].encryptedData, updatedSecret[0].encryptedDek);
    } catch (e) {
      console.error(`Failed to decrypt secret ${updatedSecret[0].id}`, e);
    }

    return { ...updatedSecret[0], data };
  }

  /**
   * Deletes all secrets for a user.
   */
  static async deleteAllUserSecrets(userId: string) {
    await db.delete(secrets)
      .where(eq(secrets.userId, userId));
    return true;
  }
}
