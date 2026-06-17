import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { verify } from 'otplib';
import { UserService } from '@/lib/services/user.service';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import { signVaultMfaCookie, VAULT_MFA_COOKIE_NAME } from '@/lib/vault-mfa-cookie';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    // Rate limit: 5 attempts per 15 minutes per user
    const rateLimit = checkRateLimit(`mfa_verify_${session.user.id}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get the user's saved secret
    const user = await UserService.getMfaStatus(session.user.id);

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json(
        { error: 'MFA is not enabled for this user' },
        { status: 400 }
      );
    }

    if (isTokenUsed(session.user.id, token)) {
      return NextResponse.json({ error: 'Token already used. Please wait for a new code.' }, { status: 400 });
    }

    // Validate the token against the user's saved secret
    const result = await verify({
      token,
      secret: user.mfaSecret,
    });

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    markTokenUsed(session.user.id, token);

    const cookieStore = await cookies();
    // Set a 15-minute cookie for viewing sensitive secrets
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const cookieVal = signVaultMfaCookie(session.user.id, expiresAt);
    
    cookieStore.set(VAULT_MFA_COOKIE_NAME, cookieVal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying MFA token:', error);
    return NextResponse.json(
      { error: 'Failed to verify MFA token' },
      { status: 500 }
    );
  }
}
