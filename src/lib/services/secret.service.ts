import { db } from '@/db';
import { secrets } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { encryptPayload, decryptPayload, encryptString, decryptString } from '../helpers/crypto';

// Re-export type for convenience
import type { SecretType } from '../secret-types';

export class SecretService {
  /**
   * Retrieves the total count of secrets for a user.
   */
  static async countByUserId(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(secrets)
      .where(eq(secrets.userId, userId));
    return Number(result[0].count);
  }

  /**
   * Retrieves all secrets for a user, with their payloads decrypted.
   * @param userId The user's ID
   * @param limit The maximum number of records to return
   * @param offset The number of records to skip
   */
  static async findAllByUserId(userId: string, limit: number = 50, offset: number = 0) {
    const userSecrets = await db.query.secrets.findMany({
      where: eq(secrets.userId, userId),
      orderBy: (secrets, { desc }) => [desc(secrets.createdAt)],
      limit,
      offset,
    });

    return userSecrets.map(secret => {
      let data = {};
      let title = secret.title;

      try {
        title = decryptString(secret.title);
      } catch (e) {
        if (e instanceof Error && e.message === 'Invalid encrypted data format') {
          title = secret.title;
        } else {
          console.error('Failed to decrypt title:', e instanceof Error ? e.message : 'Unknown error');
          title = '[Encrypted - Key mismatch]';
        }
      }

      if (!secret.isSensitive) {
        try {
          data = decryptPayload(secret.encryptedData, secret.encryptedDek);
        } catch (e) {
          console.error('Failed to decrypt secret:', e instanceof Error ? e.message : 'Unknown error');
          data = { error: 'Failed to decrypt data' };
        }
      }
      return {
        ...secret,
        title,
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
    let title = secret.title;

    try {
      title = decryptString(secret.title);
    } catch (e) {
      if (e instanceof Error && e.message === 'Invalid encrypted data format') {
        title = secret.title;
      } else {
        console.error('Failed to decrypt title:', e instanceof Error ? e.message : 'Unknown error');
        title = '[Encrypted - Key mismatch]';
      }
    }

    try {
      data = decryptPayload(secret.encryptedData, secret.encryptedDek);
    } catch (e) {
      console.error('Failed to decrypt secret:', e instanceof Error ? e.message : 'Unknown error');
      data = { error: 'Failed to decrypt data' };
    }

    return {
      ...secret,
      title,
      data,
    };
  }

  /**
   * Creates a new secret, encrypting the data payload using envelope encryption.
   */
  static async createSecret(userId: string, type: SecretType, title: string, data: any, isSensitive: boolean = false) {
    const { encryptedData, encryptedDek } = encryptPayload(data);
    const encryptedTitle = encryptString(title);

    const newSecret = await db.insert(secrets)
      .values({
        userId,
        type,
        title: encryptedTitle,
        encryptedData,
        encryptedDek,
        isSensitive,
      })
      .returning();

    return {
      ...newSecret[0],
      title,
      data,
    };
  }

  /**
   * Updates an existing secret, re-encrypting the data payload.
   */
  static async updateSecret(userId: string, secretId: string, title: string, data: any, isSensitive: boolean = false) {
    const { encryptedData, encryptedDek } = encryptPayload(data);
    const encryptedTitle = encryptString(title);

    const updatedSecret = await db.update(secrets)
      .set({
        title: encryptedTitle,
        encryptedData,
        encryptedDek,
        isSensitive,
      })
      .where(and(eq(secrets.id, secretId), eq(secrets.userId, userId)))
      .returning();

    if (!updatedSecret.length) {
      return null;
    }

    return {
      ...updatedSecret[0],
      title,
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
    const updatedSecret = await db.update(secrets)
      .set({ isFavorite: sql`NOT ${secrets.isFavorite}` })
      .where(and(eq(secrets.id, secretId), eq(secrets.userId, userId)))
      .returning();

    if (!updatedSecret.length) return null;

    let data = {};
    let title = updatedSecret[0].title;

    try {
      title = decryptString(updatedSecret[0].title);
    } catch (e) {
      if (e instanceof Error && e.message === 'Invalid encrypted data format') {
        title = updatedSecret[0].title;
      } else {
        console.error('Failed to decrypt title:', e instanceof Error ? e.message : 'Unknown error');
        title = '[Encrypted - Key mismatch]';
      }
    }

    try {
      data = decryptPayload(updatedSecret[0].encryptedData, updatedSecret[0].encryptedDek);
    } catch (e) {
      console.error('Failed to decrypt secret:', e instanceof Error ? e.message : 'Unknown error');
    }

    return { ...updatedSecret[0], title, data };
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
