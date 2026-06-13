import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await SecretService.deleteAllUserSecrets(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing vault:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
