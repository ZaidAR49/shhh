import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
export async function getServerAuth() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return null;
    }

    return session.user;
}