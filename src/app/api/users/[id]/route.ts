import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/helpers/auth";
import { UserService } from "@/lib/services/user.service";
import { z } from "zod";

const updateUserSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").trim(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getServerAuth();
    const { id } = await params;
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
        const foundUser = await UserService.findById(id);
        return NextResponse.json({ users: foundUser }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 400 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getServerAuth();
    const { id } = await params;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name } = updateUserSchema.parse(body);

        const updatedUser = await UserService.updateName(id, name);

        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}
