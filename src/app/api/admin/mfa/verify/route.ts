import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verify } from 'otplib';
import { UserService } from '@/lib/services/user.service';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import { signAdminMfaCookie, ADMIN_MFA_COOKIE_NAME } from '@/lib/admin-mfa-cookie';

const COOKIE_TTL_SECONDS = 60 * 60 * 4; // 4 hours

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role as string | undefined;
    if (!userRole || !['admin', 'supervisor', 'viewer'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden: admin access only' }, { status: 403 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    // Rate limit: 5 attempts per 15 minutes per user
    const rateLimit = checkRateLimit(`admin_mfa_${session.user.id}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || token.length > 10) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Get the user's MFA secret
    const user = await UserService.getMfaStatus(session.user.id);

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json(
        {
          error:
            'MFA is not enabled on your account. Please enable 2FA in your vault settings before accessing the admin panel.',
        },
        { status: 400 }
      );
    }

    if (isTokenUsed(session.user.id, token)) {
      return NextResponse.json(
        { error: 'Token already used. Please wait for a new code.' },
        { status: 400 }
      );
    }

    const result = await verify({ token, secret: user.mfaSecret });

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    markTokenUsed(session.user.id, token);

    // Issue a signed httpOnly cookie valid for 4 hours
    const expiresAt = Date.now() + COOKIE_TTL_SECONDS * 1000;
    const cookieValue = signAdminMfaCookie(session.user.id, expiresAt);

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_MFA_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_TTL_SECONDS,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying admin MFA token:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}
