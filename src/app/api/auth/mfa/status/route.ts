import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { UserService } from '@/lib/services/user.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const user = await UserService.getMfaStatus(session.user.id);

    return NextResponse.json({ 
      mfaEnabled: user?.mfaEnabled ?? false,
      notificationsEnabled: user?.notificationsEnabled ?? true,
      preferredLocale: user?.preferredLocale ?? 'en'
    });
  } catch (error) {
    console.error('Error fetching MFA status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MFA status' },
      { status: 500 }
    );
  }
}
