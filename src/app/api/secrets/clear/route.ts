import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';

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

    if (userStatus?.mfaEnabled && userStatus?.mfaSecret) {
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
    } else {
      if (!body.confirm) {
        return NextResponse.json({ error: 'Confirmation required to clear vault' }, { status: 400 });
      }
    }

    await SecretService.deleteAllUserSecrets(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing vault:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
