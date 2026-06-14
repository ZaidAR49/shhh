import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';

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
    const updatedSecret = await SecretService.toggleFavorite(session.user.id, id);

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
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
