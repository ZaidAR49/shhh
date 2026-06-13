import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const secret = await SecretService.findById(session.user.id, id);

    if (!secret) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
    }

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

    return NextResponse.json(mappedSecret);
  } catch (error) {
    console.error('Error fetching secret:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const title = body.name || body.title;
    const data = body.fields || body.data;
    const isSensitive = body.is_sensitive ?? body.isSensitive ?? false;

    if (body.tags && data) {
      data.tags = body.tags;
    }

    if (!title || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedSecret = await SecretService.updateSecret(
      session.user.id,
      id,
      title,
      data,
      isSensitive
    );

    if (!updatedSecret) {
      return NextResponse.json({ error: 'Secret not found or unauthorized' }, { status: 404 });
    }

    const mappedSecret = {
      id: updatedSecret.id,
      user_id: updatedSecret.userId,
      name: updatedSecret.title,
      secret_type: updatedSecret.type,
      encrypted_blob: updatedSecret.encryptedData,
      decrypted_fields: updatedSecret.data,
      created_at: updatedSecret.createdAt.toISOString(),
      updated_at: updatedSecret.updatedAt.toISOString(),
      is_favorite: updatedSecret.isFavorite,
      is_sensitive: updatedSecret.isSensitive,
      tags: (updatedSecret.data as any)?.tags || []
    };

    return NextResponse.json(mappedSecret);
  } catch (error) {
    console.error('Error updating secret:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const success = await SecretService.deleteSecret(session.user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Secret not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
