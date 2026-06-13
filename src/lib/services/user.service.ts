import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encryptString, decryptString } from "@/lib/helpers/crypto";

export class UserService {

    static async findById(id: string) {
        return await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        });
    }

    static async updateName(id: string, name: string) {
        const updatedUser = await db.update(users)
            .set({ name })
            .where(eq(users.id, id))
            .returning();
        return updatedUser[0];
    }

    static async getMfaStatus(id: string) {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
            columns: {
                mfaEnabled: true,
                mfaSecret: true,
            },
        });
        
        if (user?.mfaSecret) {
            try {
                user.mfaSecret = decryptString(user.mfaSecret);
            } catch (e) {
                // Fallback for legacy plaintext secrets already in the database
            }
        }
        
        return user;
    }

    static async setPendingMfaSecret(id: string, secret: string) {
        const encryptedSecret = encryptString(secret);
        const updatedUser = await db.update(users)
            .set({ mfaSecret: encryptedSecret })
            .where(eq(users.id, id))
            .returning();
        return updatedUser[0];
    }

    static async enableMfa(id: string) {
        const updatedUser = await db.update(users)
            .set({ mfaEnabled: true })
            .where(eq(users.id, id))
            .returning();
        return updatedUser[0];
    }

    static async disableMfa(id: string) {
        const updatedUser = await db.update(users)
            .set({ mfaEnabled: false, mfaSecret: null })
            .where(eq(users.id, id))
            .returning();
        return updatedUser[0];
    }
}
