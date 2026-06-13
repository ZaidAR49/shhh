import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import type { SecretType } from '@/lib/secret-types';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let secrets = await SecretService.findAllByUserId(session.user.id);

    if (query) {
      const q = query.toLowerCase();
      secrets = secrets.filter(s => s.title.toLowerCase().includes(q));
    }

    // Map to frontend expected Secret interface
    const mappedSecrets = secrets.map(s => ({
      id: s.id,
      user_id: s.userId,
      name: s.title,
      secret_type: s.type,
      encrypted_blob: s.encryptedData,
      decrypted_fields: s.data,
      created_at: s.createdAt.toISOString(),
      updated_at: s.updatedAt.toISOString(),
      is_favorite: s.isFavorite,
      is_sensitive: s.isSensitive,
      tags: (s.data as any)?.tags || []
    }));

    return NextResponse.json(mappedSecrets);
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

    const secret = await SecretService.createSecret(
      session.user.id,
      type as SecretType,
      title,
      data,
      isSensitive
    );

    // Map to frontend expected Secret interface
    const mappedSecret = {
      id: secret.id,
      user_id: secret.userId,
      name: secret.title,
      secret_type: secret.type,
      encrypted_blob: secret.encryptedData,
      decrypted_fields: secret.data,
      created_at: secret.createdAt.toISOString(),
      updated_at: secret.updatedAt.toISOString(),
      is_favorite: secret.isFavorite,
      is_sensitive: secret.isSensitive,
      tags: (secret.data as any)?.tags || []
    };

    return NextResponse.json(mappedSecret, { status: 201 });
  } catch (error) {
    console.error('Error creating secret:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
