import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { UserService } from '@/lib/services/user.service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Disable MFA by setting mfaEnabled to false and clearing the secret
    await UserService.disableMfa(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}
