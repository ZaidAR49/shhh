import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { sendNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const rateLimit = checkRateLimit(`mfa_disable_${session.user.id}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'MFA token is required' }, { status: 400 });
    }

    const user = await UserService.getMfaStatus(session.user.id);

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json({ error: 'MFA is not enabled' }, { status: 400 });
    }

    if (isTokenUsed(session.user.id, token)) {
      return NextResponse.json({ error: 'Token already used. Please wait for a new code.' }, { status: 400 });
    }

    const verificationResult = await verify({
      token,
      secret: user.mfaSecret,
    });

    if (!verificationResult.valid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    markTokenUsed(session.user.id, token);

    // Disable MFA by setting mfaEnabled to false and clearing the secret
    await UserService.disableMfa(session.user.id);

    // Send notification
    await sendNotification(
      session.user.id,
      'mfaDisabled'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}
