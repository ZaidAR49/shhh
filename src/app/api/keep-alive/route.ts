import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Execute a simple query to keep the database active
    await db.execute(sql`SELECT 1`);
    
    return NextResponse.json({ success: true, message: 'Database kept alive successfully' });
  } catch (error) {
    console.error('Keep-alive failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
