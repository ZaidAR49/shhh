import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SecretService } from '@/lib/services/secret.service';
import { UserService } from '@/lib/services/user.service';
import { SECRET_TYPE_CONFIG_MAP } from '@/lib/secret-types';
import type { SecretType } from '@/lib/secret-types';
import { SECRET_SCHEMAS } from '@/lib/validations';
import { verify } from 'otplib';
import { checkRateLimit, isTokenUsed, markTokenUsed } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import { verifyVaultMfaCookie, VAULT_MFA_COOKIE_NAME } from '@/lib/vault-mfa-cookie';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const enMessages = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'messages', 'en.json'), 'utf8'));
const arMessages = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'messages', 'ar.json'), 'utf8'));

const MAX_SECRETS = 50;

function escapeHtml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendImportNotification(
  userId: string,
  userName: string,
  userEmail: string,
  locale: string,
  mode: 'replace' | 'merge',
  count: number
) {
  try {
    const now = new Date();
    const date = now.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const time = now.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    const messages = locale === 'ar' ? arMessages : enMessages;
    const title = messages.notifications.secretsImportedTitle;

    const modeLabel = locale === 'ar'
      ? (mode === 'replace' ? 'استبدال الكل' : 'إضافة ودمج')
      : (mode === 'replace' ? 'Replace All' : 'Add & Merge');

    const alertClass = mode === 'replace' ? 'alert-box-replace' : 'alert-box';
    const modeClass = mode === 'replace' ? 'mode-replace' : 'mode-merge';

    const templatePath = path.join(process.cwd(), 'src', 'templates', `import_${locale}.html`);
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html
      .replace(/{{title}}/g, escapeHtml(title))
      .replace(/{{name}}/g, escapeHtml(userName || 'User'))
      .replace(/{{date}}/g, escapeHtml(date))
      .replace(/{{time}}/g, escapeHtml(time))
      .replace(/{{modeLabel}}/g, escapeHtml(modeLabel))
      .replace(/{{alertClass}}/g, alertClass)
      .replace(/{{modeClass}}/g, modeClass)
      .replace(/{{count}}/g, String(count));

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

    console.log(`[Import] Notification sent to user ${userId}`);
  } catch (err) {
    console.error(`[Import] Failed to send notification:`, err);
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json({ error: 'Two-Factor Authentication must be enabled to use import.' }, { status: 403 });
    }

    // Check vault_mfa_ok session cookie first
    const cookieStore = await cookies();
    const mfaCookie = cookieStore.get(VAULT_MFA_COOKIE_NAME)?.value;
    const validCookieUserId = mfaCookie ? verifyVaultMfaCookie(mfaCookie) : null;
    const hasValidCookie = validCookieUserId === session.user.id;

    const body = await request.json();
    const { mode, secrets: importedSecrets, token } = body;

    if (!mode || !['replace', 'merge'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid import mode. Must be "replace" or "merge".' }, { status: 400 });
    }

    if (!Array.isArray(importedSecrets) || importedSecrets.length === 0) {
      return NextResponse.json({ error: 'No secrets provided for import.' }, { status: 400 });
    }

    if (!hasValidCookie) {
      // Require OTP token in body
      if (!token) {
        return NextResponse.json({ error: 'MFA_REQUIRED' }, { status: 403 });
      }

      const rateLimit = checkRateLimit(`mfa_import_${session.user.id}`, 5, 15 * 60 * 1000);
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

    // Validate all secrets before touching the DB
    const validatedSecrets: Array<{
      id: string;
      name: string;
      type: SecretType;
      data: any;
      isSensitive: boolean;
      isFavorite: boolean;
    }> = [];

    for (const s of importedSecrets) {
      const secretType = s.secret_type || s.type;
      const name = s.name || s.title;
      const fields = s.decrypted_fields || s.fields || s.data || {};

      if (!secretType || !name) {
        return NextResponse.json({ error: `Invalid secret entry: missing type or name.` }, { status: 400 });
      }

      if (!SECRET_TYPE_CONFIG_MAP[secretType as SecretType]) {
        return NextResponse.json({ error: `Invalid secret type: "${secretType}".` }, { status: 400 });
      }

      let parsedData: any;
      try {
        // Parse and validate — use safeParse to allow partial data
        const result = SECRET_SCHEMAS[secretType as SecretType].safeParse(fields);
        parsedData = result.success ? result.data : fields;
      } catch {
        parsedData = fields;
      }

      // Merge tags into data if present at top level
      if (s.tags && Array.isArray(s.tags)) {
        parsedData.tags = s.tags;
      }

      validatedSecrets.push({
        id: s.id,
        name,
        type: secretType as SecretType,
        data: parsedData,
        isSensitive: Boolean(s.is_sensitive),
        isFavorite: Boolean(s.is_favorite),
      });
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    if (mode === 'replace') {
      // Delete all existing secrets, then create all imported ones
      await SecretService.deleteAllUserSecrets(session.user.id);

      const toCreate = validatedSecrets.slice(0, MAX_SECRETS);
      skipped = validatedSecrets.length - toCreate.length;

      for (const s of toCreate) {
        await SecretService.createSecret(session.user.id, s.type, s.name, s.data, s.isSensitive);
        imported++;
      }
    } else {
      // Merge mode: update if ID exists, create if not
      const currentCount = await SecretService.countByUserId(session.user.id);
      let slotsAvailable = MAX_SECRETS - currentCount;

      for (const s of validatedSecrets) {
        const existing = s.id ? await SecretService.findById(session.user.id, s.id, false) : null;

        if (existing) {
          // Overwrite existing secret by ID
          await SecretService.updateSecret(session.user.id, s.id, s.name, s.data, s.isSensitive);
          updated++;
        } else if (slotsAvailable > 0) {
          // Create new secret
          await SecretService.createSecret(session.user.id, s.type, s.name, s.data, s.isSensitive);
          imported++;
          slotsAvailable--;
        } else {
          skipped++;
        }
      }
    }

    // Fire email notification (non-blocking)
    const [userRecord] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    if (userRecord?.notificationsEnabled && userRecord?.email) {
      void sendImportNotification(
        session.user.id,
        userRecord.name || 'User',
        userRecord.email,
        userRecord.preferredLocale || 'en',
        mode,
        imported + updated
      );
    }

    return NextResponse.json(
      { success: true, imported, updated, skipped },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error importing secrets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
