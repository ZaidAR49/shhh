import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { verify } from 'otplib';
import { UserService } from '@/lib/services/user.service';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
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

    // Rate limit: 5 attempts per 15 minutes per user
    const rateLimit = checkRateLimit(`mfa_enable_${session.user.id}`, 5, 15 * 60 * 1000);
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

    // Get the pending secret from the database
    const user = await UserService.getMfaStatus(session.user.id);
    if (!user || !user.mfaSecret) {
      return NextResponse.json(
        { error: 'MFA setup not initiated' },
        { status: 400 }
      );
    }

    if (isTokenUsed(session.user.id, token)) {
      return NextResponse.json({ error: 'Token already used. Please wait for a new code.' }, { status: 400 });
    }

    // Validate the token against the pending secret
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

    // If valid, enable MFA
    await UserService.enableMfa(session.user.id);

    // Send notification
    await sendNotification(
      session.user.id,
      'mfaEnabled'
    );

    // Send notification

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enabling MFA:', error);
    return NextResponse.json(
      { error: 'Failed to enable MFA' },
      { status: 500 }
    );
  }
}
