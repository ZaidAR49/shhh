import { db } from "@/db";
import { users, secrets } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verify } from "otplib";
import { UserService } from "@/lib/services/user.service";
import { checkRateLimit, isTokenUsed, markTokenUsed } from "@/lib/rate-limit";

/** Verify an inline MFA token submitted with a sensitive request. */
async function requireMfaToken(
  request: Request,
  sessionUserId: string
): Promise<NextResponse | null> {
  const mfaToken = request.headers.get("x-admin-mfa-token");

  if (!mfaToken) {
    return NextResponse.json(
      { error: "MFA token is required for this action.", mfaRequired: true },
      { status: 403 }
    );
  }

  const rateLimit = checkRateLimit(`admin_sensitive_${sessionUserId}`, 5, 15 * 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many MFA attempts. Please try again later." },
      { status: 429 }
    );
  }

  const user = await UserService.getMfaStatus(sessionUserId);
  if (!user?.mfaEnabled || !user.mfaSecret) {
    return NextResponse.json({ error: "MFA is not enabled on your account." }, { status: 400 });
  }

  if (isTokenUsed(sessionUserId, mfaToken)) {
    return NextResponse.json(
      { error: "Token already used. Please wait for a new code." },
      { status: 400 }
    );
  }

  const result = await verify({ token: mfaToken, secret: user.mfaSecret });
  if (!result.valid) {
    return NextResponse.json(
      { error: "Invalid MFA code. Please try again.", mfaRequired: true },
      { status: 403 }
    );
  }

  markTokenUsed(sessionUserId, mfaToken);
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "supervisor"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const allUsers = await db.select().from(users);

    const secretCounts = await db
      .select({ userId: secrets.userId, count: count() })
      .from(secrets)
      .groupBy(secrets.userId);

    const countsMap = new Map(secretCounts.map((r) => [r.userId, r.count]));

    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      image:
        user.image ||
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name || user.email}&backgroundColor=b6e3f4`,
      role: user.role,
      status: user.isLocked ? "locked" : "active",
      secretsCount: countsMap.get(user.id) || 0,
      mfaEnabled: user.mfaEnabled,
      preferredLocale: user.preferredLocale,
      notificationsEnabled: user.notificationsEnabled,
      joinedAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : null,
      lastActive: null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Only admins can create users." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    // Require MFA re-verification when creating an admin-tier account
    const isAdminTier = role && ["admin", "supervisor", "viewer"].includes(role);
    if (isAdminTier) {
      const err = await requireMfaToken(request, session.user.id);
      if (err) return err;
    }

    // Check for duplicate email
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }

    const newUser = await db
      .insert(users)
      .values({
        name: name || null,
        email,
        role: role || "admin",
        preferredLocale: "en",
        notificationsEnabled: true,
        mfaEnabled: false,
        isLocked: false,
      })
      .returning();

    return NextResponse.json({ success: true, user: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

