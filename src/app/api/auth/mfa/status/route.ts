import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { UserService } from '@/lib/services/user.service';
import { cookies } from 'next/headers';
import { verifyVaultMfaCookie, VAULT_MFA_COOKIE_NAME } from '@/lib/vault-mfa-cookie';

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

    // Check if vault MFA session cookie is active
    const cookieStore = await cookies();
    const mfaCookie = cookieStore.get(VAULT_MFA_COOKIE_NAME)?.value;
    const validCookieUserId = mfaCookie ? verifyVaultMfaCookie(mfaCookie) : null;
    const vaultMfaSessionActive = validCookieUserId === session.user.id;

    return NextResponse.json({ 
      mfaEnabled: user?.mfaEnabled ?? false,
      notificationsEnabled: user?.notificationsEnabled ?? true,
      preferredLocale: user?.preferredLocale ?? 'en',
      vaultMfaSessionActive,
    });
  } catch (error) {
    console.error('Error fetching MFA status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MFA status' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // We only need to clear the vault session cookie
    const { clearVaultMfaSession } = await import('@/lib/vault-mfa-cookie');
    await clearVaultMfaSession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing MFA status:', error);
    return NextResponse.json(
      { error: 'Failed to clear MFA status' },
      { status: 500 }
    );
  }
}
