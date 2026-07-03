import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import { verifyVaultMfaCookie, VAULT_MFA_COOKIE_NAME, setVaultMfaSession } from '@/lib/vault-mfa-cookie';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    const userStatus = await UserService.getMfaStatus(session.user.id);

    if (!userStatus?.mfaEnabled || !userStatus?.mfaSecret) {
      return NextResponse.json(
        { error: 'You must enable Two-Factor Authentication before clearing your vault.' },
        { status: 400 }
      );
    }

    // Check vault MFA session cookie first
    const cookieStore = await cookies();
    const mfaCookie = cookieStore.get(VAULT_MFA_COOKIE_NAME)?.value;
    const validCookieUserId = mfaCookie ? verifyVaultMfaCookie(mfaCookie) : null;
    const hasValidCookie = validCookieUserId === session.user.id;

    if (!hasValidCookie) {
      if (!token) {
        return NextResponse.json({ error: 'MFA token is required' }, { status: 400 });
      }

      if (isTokenUsed(session.user.id, token)) {
        return NextResponse.json({ error: 'Token already used. Please wait for a new code.' }, { status: 400 });
      }

      const isValid = await verify({ token, secret: userStatus.mfaSecret });
      if (!isValid.valid) {
        return NextResponse.json({ error: 'Invalid MFA token' }, { status: 400 });
      }
      
      markTokenUsed(session.user.id, token);
      await setVaultMfaSession(session.user.id);
    }

    await SecretService.deleteAllUserSecrets(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing vault:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
