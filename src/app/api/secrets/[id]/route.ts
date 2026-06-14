import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { SECRET_SCHEMAS } from '@/lib/validations';
import type { SecretType } from '@/lib/secret-types';
import { z } from 'zod';
import { sendNotification } from '@/lib/email';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const { id } = await params;
    const secret = await SecretService.findById(session.user.id, id);

    if (!secret) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
    }

    if (secret.isSensitive) {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');
      
      const userStatus = await UserService.getMfaStatus(session.user.id);
      if (!userStatus?.mfaEnabled || !userStatus?.mfaSecret) {
        return NextResponse.json({ error: 'MFA not enabled' }, { status: 403 });
      }

      if (!token) {
        return NextResponse.json({ error: 'MFA token required for sensitive secret' }, { status: 403 });
      }

      const isValid = await verify({ token, secret: userStatus.mfaSecret });
      if (!isValid.valid) {
        return NextResponse.json({ error: 'Invalid MFA token' }, { status: 403 });
      }

      // Send notification for exposing sensitive secret
      await sendNotification(
        session.user.id,
        'sensitiveAccessed',
        { secretTitle: secret.title }
      );
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

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
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

    const existingSecret = await SecretService.findById(session.user.id, id);
    if (!existingSecret) {
      return NextResponse.json({ error: 'Secret not found or unauthorized' }, { status: 404 });
    }

    let parsedData;
    try {
      parsedData = SECRET_SCHEMAS[existingSecret.type as SecretType].parse(data);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const updatedSecret = await SecretService.updateSecret(
      session.user.id,
      id,
      title,
      parsedData,
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

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const { id } = await params;
    
    // Fetch first to see if it's sensitive
    const secret = await SecretService.findById(session.user.id, id);
    if (!secret) {
      return NextResponse.json({ error: 'Secret not found or unauthorized' }, { status: 404 });
    }

    const success = await SecretService.deleteSecret(session.user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete secret' }, { status: 500 });
    }

    if (secret.isSensitive) {
      // Send notification for deleting sensitive secret
      await sendNotification(
        session.user.id,
        'sensitiveDeleted',
        { secretTitle: secret.title }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
