import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendNotification } from '@/lib/email';
import { isTokenUsed, markTokenUsed } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await UserService.findById(session.user.id);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const body = await request.json().catch(() => ({}));
    
    // We handle updates for name and notificationsEnabled
    const updateData: any = {};
    let isUpdating = false;

    if (body.name && typeof body.name === 'string' && body.name.trim().length > 0) {
      updateData.name = body.name.trim().slice(0, 100);
      isUpdating = true;
    }

    if (typeof body.notificationsEnabled === 'boolean') {
      updateData.notificationsEnabled = body.notificationsEnabled;
      isUpdating = true;
    }

    if (body.preferredLocale && (body.preferredLocale === 'en' || body.preferredLocale === 'ar')) {
      updateData.preferredLocale = body.preferredLocale;
      isUpdating = true;
    }

    if (!isUpdating) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, ...updateData });
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

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
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

    if (isTokenUsed(session.user.id, token)) {
      return NextResponse.json({ error: 'Token already used. Please wait for a new code.' }, { status: 400 });
    }

    const verificationResult = await verify({
      token,
      secret: user.mfaSecret!,
    });

    if (!verificationResult.valid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    markTokenUsed(session.user.id, token);

    // Send notification BEFORE deleting the user (so they still exist in the DB)
    await sendNotification(
      session.user.id,
      'accountDeleted'
    );

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
