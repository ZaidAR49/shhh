import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';
import { verify } from 'otplib';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import { verifyVaultMfaCookie, VAULT_MFA_COOKIE_NAME } from '@/lib/vault-mfa-cookie';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const enMessages = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'messages', 'en.json'), 'utf8'));
const arMessages = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'messages', 'ar.json'), 'utf8'));

function escapeHtml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendExportNotification(userId: string, userName: string, userEmail: string, locale: string) {
  try {
    const now = new Date();
    const date = now.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const time = now.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    const messages = locale === 'ar' ? arMessages : enMessages;
    const title = messages.notifications.secretsExportedTitle;

    const templatePath = path.join(process.cwd(), 'src', 'templates', `export_${locale}.html`);
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html
      .replace(/{{title}}/g, escapeHtml(title))
      .replace(/{{name}}/g, escapeHtml(userName || 'User'))
      .replace(/{{date}}/g, escapeHtml(date))
      .replace(/{{time}}/g, escapeHtml(time));

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Shhh Security Alert: ${title}`,
      html,
    });

    console.log(`[Export] Notification sent to user ${userId}`);
  } catch (err) {
    console.error(`[Export] Failed to send notification:`, err);
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await UserService.isLocked(session.user.id)) {
      return NextResponse.json({ error: 'Account is locked' }, { status: 423 });
    }

    const userStatus = await UserService.getMfaStatus(session.user.id);

    // Feature requires MFA to be enabled
    if (!userStatus?.mfaEnabled || !userStatus?.mfaSecret) {
      return NextResponse.json({ error: 'Two-Factor Authentication must be enabled to use export.' }, { status: 403 });
    }

    // Check vault_mfa_ok session cookie first
    const cookieStore = await cookies();
    const mfaCookie = cookieStore.get(VAULT_MFA_COOKIE_NAME)?.value;
    const validCookieUserId = mfaCookie ? verifyVaultMfaCookie(mfaCookie) : null;
    const hasValidCookie = validCookieUserId === session.user.id;

    if (!hasValidCookie) {
      // Fall back to one-time token from header
      const token = request.headers.get('x-mfa-token');
      if (!token) {
        return NextResponse.json({ error: 'MFA_REQUIRED' }, { status: 403 });
      }

      const rateLimit = checkRateLimit(`mfa_export_${session.user.id}`, 5, 15 * 60 * 1000);
      if (!rateLimit.success) {
        return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 });
      }

      if (isTokenUsed(session.user.id, token)) {
        return NextResponse.json({ error: 'Token already used. Please wait for a new code.' }, { status: 400 });
      }

      const isValid = await verify({ token, secret: userStatus.mfaSecret });
      if (!isValid.valid) {
        return NextResponse.json({ error: 'Invalid MFA token' }, { status: 403 });
      }

      markTokenUsed(session.user.id, token);
    }

    // Fetch all user secrets — including sensitive ones (fully decrypted)
    const allSecrets = await SecretService.findAllByUserId(session.user.id, 10000, 0, true);

    const exportData = {
      version: 1,
      exported_at: new Date().toISOString(),
      secrets: allSecrets.map(s => ({
        id: s.id,
        name: s.title,
        secret_type: s.type,
        decrypted_fields: s.data || {},
        is_sensitive: s.isSensitive,
        is_favorite: s.isFavorite,
        tags: (s.data as any)?.tags || [],
      })),
    };

    // Fire email notification (non-blocking)
    const [userRecord] = await (await import('@/db')).db
      .select()
      .from((await import('@/db/schema')).users)
      .where((await import('drizzle-orm')).eq((await import('@/db/schema')).users.id, session.user.id))
      .limit(1);

    if (userRecord?.notificationsEnabled && userRecord?.email) {
      void sendExportNotification(
        session.user.id,
        userRecord.name || 'User',
        userRecord.email,
        userRecord.preferredLocale || 'en'
      );
    }

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="shhh-secrets.json"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error exporting secrets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
