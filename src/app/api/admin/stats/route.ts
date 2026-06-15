import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['admin', 'supervisor'].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const res = await db.execute(sql`SELECT * FROM admin_analytics LIMIT 1`);
    const analytics = res.rows[0];

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

    const secretTypes = Object.keys(colors).map(type => ({
      type: friendlyNames[type] || type,
      count: parseInt(analytics?.[`secrets_${type}`] as string || "0", 10),
      color: colors[type] || "var(--muted-foreground)"
    })).filter(t => t.count > 0);

    return NextResponse.json({ secretTypes, analytics });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
