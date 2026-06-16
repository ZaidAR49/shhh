import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';
import { SECRET_TYPE_CONFIG_MAP } from '@/lib/secret-types';
import type { SecretType } from '@/lib/secret-types';
import { SECRET_SCHEMAS } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = Math.min(Math.max(parseInt(limitParam || '', 10) || 50, 1), 100);
    const offset = Math.max(parseInt(offsetParam || '', 10) || 0, 0);

    let secrets;
    let nextOffset = null;

    if (query) {
      // If we have a query, we have to fetch all secrets and filter in memory
      // because title is encrypted.
      const allSecrets = await SecretService.findAllByUserId(session.user.id, 10000, 0); // High limit to act as 'all'
      const q = query.toLowerCase();
      const filteredSecrets = allSecrets.filter(s => s.title.toLowerCase().includes(q));

      secrets = filteredSecrets.slice(offset, offset + limit);
      if (filteredSecrets.length > offset + limit) {
        nextOffset = offset + limit;
      }
    } else {
      // Standard db pagination
      secrets = await SecretService.findAllByUserId(session.user.id, limit + 1, offset);
      if (secrets.length > limit) {
        nextOffset = offset + limit;
        secrets.pop(); // Remove the extra record
      }
    }

    // Map to frontend expected Secret interface
    const mappedSecrets = secrets.map(s => ({
      id: s.id,
      user_id: s.userId,
      name: s.isSensitive ? '[Sensitive]' : s.title,
      secret_type: s.type,
      decrypted_fields: s.data,
      created_at: s.createdAt.toISOString(),
      updated_at: s.updatedAt.toISOString(),
      is_favorite: s.isFavorite,
      is_sensitive: s.isSensitive,
      tags: (s.data as any)?.tags || []
    }));

    return NextResponse.json({ data: mappedSecrets, nextOffset }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('Error fetching secrets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const secretCount = await SecretService.countByUserId(session.user.id);
    if (secretCount >= 50) {
      return NextResponse.json({ error: 'Maximum limit of 50 secrets reached. Please delete some secrets to add more.' }, { status: 403 });
    }

    const body = await request.json();
    
    // Support both new mapping and old mapping
    const type = body.secret_type || body.type;
    const title = body.name || body.title;
    const data = body.fields || body.data;
    const isSensitive = body.is_sensitive ?? body.isSensitive ?? false;

    // Merge tags into data if passed separately
    if (body.tags && data) {
      data.tags = body.tags;
    }

    if (!type || !title || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!SECRET_TYPE_CONFIG_MAP[type as SecretType]) {
      return NextResponse.json({ error: 'Invalid secret type' }, { status: 400 });
    }

    let parsedData;
    try {
      parsedData = SECRET_SCHEMAS[type as SecretType].parse(data);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: e.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const secret = await SecretService.createSecret(
      session.user.id,
      type as SecretType,
      title,
      parsedData,
      isSensitive
    );

    // Map to frontend expected Secret interface
    const mappedSecret = {
      id: secret.id,
      user_id: secret.userId,
      name: secret.title,
      secret_type: secret.type,
      decrypted_fields: secret.data,
      created_at: secret.createdAt.toISOString(),
      updated_at: secret.updatedAt.toISOString(),
      is_favorite: secret.isFavorite,
      is_sensitive: secret.isSensitive,
      tags: (secret.data as any)?.tags || []
    };

    return NextResponse.json(mappedSecret, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('Error creating secret:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
