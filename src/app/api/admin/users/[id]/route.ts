import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { verifyAdminMfaCookie, ADMIN_MFA_COOKIE_NAME } from "@/lib/admin-mfa-cookie";
import { verify } from "otplib";
import { UserService } from "@/lib/services/user.service";
import { checkRateLimit, isTokenUsed, markTokenUsed } from "@/lib/rate-limit";

/** Verify an inline MFA token submitted with a sensitive request.
 *  Returns null on success, or an error NextResponse to return immediately. */
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

  // Rate limit
  const rateLimit = checkRateLimit(`admin_sensitive_${sessionUserId}`, 5, 15 * 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many MFA attempts. Please try again later." },
      { status: 429 }
    );
  }

  const user = await UserService.getMfaStatus(sessionUserId);
  if (!user?.mfaEnabled || !user.mfaSecret) {
    return NextResponse.json(
      { error: "MFA is not enabled on your account." },
      { status: 400 }
    );
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
  return null; // success
}

/** Check whether the target role is an "elevated" admin role requiring extra MFA */
function isAdminRole(role: string | undefined) {
  return role && ["admin", "supervisor", "viewer"].includes(role);
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "supervisor"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = params;

    // A supervisor cannot modify an admin
    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((session.user as any).role === "supervisor" && targetUser[0].role === "admin") {
      return NextResponse.json({ error: "Supervisor cannot modify admin" }, { status: 403 });
    }

    // Role updates: supervisor cannot grant admin
    let newRole = body.role;
    if (newRole && (session.user as any).role === "supervisor" && newRole === "admin") {
      return NextResponse.json({ error: "Supervisor cannot grant admin role" }, { status: 403 });
    }

    // Enforce MFA for administrative roles
    const isChangingToAdmin = newRole !== undefined && isAdminRole(newRole) && !isAdminRole(targetUser[0].role);
    const willHaveAdminRole = newRole !== undefined ? isAdminRole(newRole) : isAdminRole(targetUser[0].role);
    const isDisablingMfa = body.mfaEnabled === false && targetUser[0].mfaEnabled === true;
    const willHaveMfa = body.mfaEnabled !== undefined ? body.mfaEnabled : targetUser[0].mfaEnabled;

    if ((isChangingToAdmin || (willHaveAdminRole && isDisablingMfa)) && !willHaveMfa) {
      return NextResponse.json(
        { error: "Two-Factor Authentication (MFA) must be enabled on this account before granting an administrative role." },
        { status: 400 }
      );
    }

    // Guard: prevent demoting the last admin (role change away from admin)
    if (targetUser[0].role === "admin" && newRole && newRole !== "admin") {
      const allAdmins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
      if (allAdmins.length <= 1) {
        return NextResponse.json(
          { error: "Cannot change the role of the last admin. Promote another admin first." },
          { status: 400 }
        );
      }
    }

    // Require MFA re-verification when granting or revoking an admin-tier role
    const targetIsAdmin = isAdminRole(targetUser[0].role);
    const newRoleIsAdmin = isAdminRole(newRole);
    const roleIsChanging = newRole !== undefined && newRole !== targetUser[0].role;
    
    if (roleIsChanging && (newRoleIsAdmin || targetIsAdmin)) {
      const err = await requireMfaToken(request, session.user.id);
      if (err) return err;
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (newRole !== undefined) updates.role = newRole;
    if (body.status !== undefined) {
      if (body.status === "locked") updates.isLocked = true;
      else updates.isLocked = false;
    }
    if (body.mfaEnabled !== undefined) updates.mfaEnabled = body.mfaEnabled;
    if (body.notificationsEnabled !== undefined) updates.notificationsEnabled = body.notificationsEnabled;
    if (body.preferredLocale !== undefined) updates.preferredLocale = body.preferredLocale;

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "supervisor"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;

    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((session.user as any).role === "supervisor" && targetUser[0].role === "admin") {
      return NextResponse.json({ error: "Supervisor cannot delete admin" }, { status: 403 });
    }

    // Prevent self-deletion via admin panel for safety
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete yourself from admin panel" }, { status: 400 });
    }

    // Guard: prevent deleting the last admin
    if (targetUser[0].role === "admin") {
      const allAdmins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
      if (allAdmins.length <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin account. Promote another admin first." },
          { status: 400 }
        );
      }
    }

    // Require MFA re-verification when deleting an admin-tier account
    if (isAdminRole(targetUser[0].role)) {
      const err = await requireMfaToken(request, session.user.id);
      if (err) return err;
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
