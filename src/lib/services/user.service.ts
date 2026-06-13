import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export class UserService {
    static async findAll() {
        return await db.query.users.findMany();
    }

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
        return await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
            columns: {
                mfaEnabled: true,
                mfaSecret: true,
            },
        });
    }

    static async enableMfa(id: string, secret: string) {
        const updatedUser = await db.update(users)
            .set({ mfaEnabled: true, mfaSecret: secret })
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
