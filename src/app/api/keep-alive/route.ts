import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, secrets, sessions, accounts } from '@/db/schema';
import { count, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Verify Authorization Header (Vercel Cron or External Scheduler)
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    // -------------------------------------------------------------------------
    // 1. Direct DB Write Activity (Works 100% with current DATABASE_URL)
    // -------------------------------------------------------------------------
    // Ensures _keepalive table exists and performs an UPSERT.
    // This writes real WAL entries and triggers Postgres write I/O metrics,
    // avoiding the synthetic "SELECT 1" zero-activity filter.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS public._keepalive (
        id INT PRIMARY KEY,
        last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO public._keepalive (id, last_ping)
      VALUES (1, NOW())
      ON CONFLICT (id) DO UPDATE SET last_ping = EXCLUDED.last_ping;
    `);

    // -------------------------------------------------------------------------
    // 2. Direct DB Read Activity (8 distinct table-level queries)
    // -------------------------------------------------------------------------
    // Queries actual schema tables to generate multi-table query volume.
    const [r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.all([
      db.select({ total: count() }).from(users),
      db.select({ total: count() }).from(secrets),
      db.select({ total: count() }).from(sessions),
      db.select({ total: count() }).from(accounts),
      db.select({ newest: sql<string>`MAX(created_at)` }).from(users),
      db.select({ newest: sql<string>`MAX(created_at)` }).from(secrets),
      db.select({ oldest: sql<string>`MIN(created_at)` }).from(users),
      db.select({ oldest: sql<string>`MIN(created_at)` }).from(secrets),
    ]);

    results.directDb = {
      pingsSent: 8,
      upsertKeepalive: true,
      stats: {
        users: r1[0]?.total ?? 0,
        secrets: r2[0]?.total ?? 0,
        sessions: r3[0]?.total ?? 0,
        accounts: r4[0]?.total ?? 0,
        newestUser: r5[0]?.newest ?? null,
        newestSecret: r6[0]?.newest ?? null,
        oldestUser: r7[0]?.oldest ?? null,
        oldestSecret: r8[0]?.oldest ?? null,
      },
    };

    // -------------------------------------------------------------------------
    // 3. Optional PostgREST Data API Pings (if API key is configured)
    // -------------------------------------------------------------------------
    // If you later add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY to .env,
    // this will automatically send additional HTTP REST hits through Supabase's API Gateway.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qtzockghmthzsdjjpceg.supabase.co';
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (apiKey) {
      const restPings: string[] = [];
      const restBaseUrl = `${supabaseUrl}/rest/v1/_keepalive`;
      const restHeaders = {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      try {
        const restRes = await fetch(`${restBaseUrl}?id=eq.1&select=id,last_ping`, {
          method: 'GET',
          headers: restHeaders,
        });
        restPings.push(`GET PostgREST: ${restRes.status}`);
      } catch (e) {
        restPings.push(`GET PostgREST error: ${(e as Error).message}`);
      }

      results.restApi = { executed: true, log: restPings };
    } else {
      results.restApi = {
        executed: false,
        note: 'Using direct DB credentials (DATABASE_URL). To enable REST API gateway hits, add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.',
      };
    }

    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), ...results });
  } catch (error) {
    console.error('[keep-alive] Failed:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}


