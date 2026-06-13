import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/helpers/auth";
import { UserService } from "@/lib/services/user.service";

export async function GET() {
    const user = await getServerAuth();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = await UserService.findAll();
    return NextResponse.json({ users }, { status: 200 });
}
