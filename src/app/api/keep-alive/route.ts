import { NextResponse } from 'next/server';

// Vercel Hobby crons fire once per day at most.
// We compensate by firing PING_COUNT sequential Supabase Data API (PostgREST)
// requests in a single execution so the rolling 7-day activity volume stays
// well above Supabase's low-activity threshold (~6-10 REST hits/day).
const PING_COUNT = 8;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[keep-alive] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return NextResponse.json(
      { ok: false, error: 'Supabase env vars not configured' },
      { status: 500 },
    );
  }

  const baseUrl = `${supabaseUrl}/rest/v1/_keepalive`;
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  const errors: string[] = [];
  let lastPing: string | null = null;
  let count: number | null = null;

  for (let i = 0; i < PING_COUNT; i++) {
    try {
      if (i % 4 === 0) {
        // Request type A: UPSERT — write activity (counts as a distinct REST hit)
        const res = await fetch(`${baseUrl}?on_conflict=id`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ id: 1, last_ping: new Date().toISOString() }),
        });
        if (!res.ok) errors.push(`upsert[${i}]: ${res.status}`);
        else {
          const data = await res.json() as Array<{ last_ping: string }>;
          lastPing = data?.[0]?.last_ping ?? lastPing;
        }
      } else if (i % 4 === 1) {
        // Request type B: SELECT — read activity
        const res = await fetch(`${baseUrl}?id=eq.1&select=id,last_ping`, {
          method: 'GET',
          headers,
        });
        if (!res.ok) errors.push(`select[${i}]: ${res.status}`);
        else {
          const data = await res.json() as Array<{ last_ping: string }>;
          lastPing = data?.[0]?.last_ping ?? lastPing;
        }
      } else if (i % 4 === 2) {
        // Request type C: HEAD/COUNT — lightweight extra PostgREST hit
        const res = await fetch(`${baseUrl}?select=*`, {
          method: 'HEAD',
          headers: { ...headers, Prefer: 'count=exact' },
        });
        if (!res.ok) errors.push(`count[${i}]: ${res.status}`);
        else {
          const raw = res.headers.get('content-range');
          count = raw ? parseInt(raw.split('/')[1] ?? '0', 10) : count;
        }
      } else {
        // Request type D: UPDATE timestamp — another write hit
        const res = await fetch(`${baseUrl}?id=eq.1`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ last_ping: new Date().toISOString() }),
        });
        if (!res.ok) errors.push(`patch[${i}]: ${res.status}`);
      }
    } catch (err) {
      errors.push(`request[${i}]: ${(err as Error).message}`);
    }
  }

  if (errors.length > 0) {
    console.error('[keep-alive] Some pings failed:', errors);
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  console.log(`[keep-alive] ${PING_COUNT} Supabase REST pings sent. Last ping: ${lastPing}`);
  return NextResponse.json({ ok: true, pingsSent: PING_COUNT, lastPing, rowCount: count });
}

