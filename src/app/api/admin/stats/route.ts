import { db } from "@/db";
import { secrets } from "@/db/schema";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'supervisor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const typeCounts = await db
      .select({ type: secrets.type, count: count() })
      .from(secrets)
      .groupBy(secrets.type);

    const colors: Record<string, string> = {
      password: "var(--accent)",
      visa: "#3b82f6",
      env_variable: "#10b981",
      api_key: "#8b5cf6",
      license: "#f59e0b",
      identity: "var(--vault-warning)",
      bank_account: "#06b6d4",
      secure_note: "var(--vault-unlocked)",
      wifi: "var(--vault-locked)"
    };

    const friendlyNames: Record<string, string> = {
      password: "Password",
      visa: "Visa",
      env_variable: "Env Variable",
      api_key: "API Key",
      license: "License",
      identity: "Identity",
      bank_account: "Bank Account",
      secure_note: "Secure Note",
      wifi: "Wi-Fi"
    };

    const breakdown = typeCounts.map((tc) => ({
      type: friendlyNames[tc.type] || tc.type,
      count: tc.count,
      color: colors[tc.type] || "var(--muted-foreground)"
    }));

    return NextResponse.json({ secretTypes: breakdown });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
