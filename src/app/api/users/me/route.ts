import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    await db
      .update(users)
      .set({ name: name.trim() })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { token } = body;

    const user = await UserService.getMfaStatus(session.user.id);

    if (!user || !user.mfaEnabled) {
      return NextResponse.json(
        { error: 'You must enable Two-Factor Authentication before deleting your account.' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json({ error: 'MFA token is required' }, { status: 400 });
    }

    const verificationResult = await verify({
      token,
      secret: user.mfaSecret!,
    });

    if (!verificationResult.valid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
