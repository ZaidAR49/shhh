import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

// Setup reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export async function sendNotification(
  userId: string,
  notificationKey: keyof typeof enMessages.notifications,
  params?: Record<string, string>
): Promise<boolean> {
  try {
    // 1. Fetch user and their notification preference
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      console.warn(`[Notification] User ${userId} not found.`);
      return false;
    }

    if (!user.notificationsEnabled) {
      console.log(`[Notification] User ${userId} has notifications disabled. Skipping.`);
      return false;
    }

    if (!user.email) {
      console.warn(`[Notification] User ${userId} has no email address.`);
      return false;
    }

    const locale = user.preferredLocale || 'en';
    const messages = locale === 'ar' ? arMessages : enMessages;

    // Resolve translations
    const titleKey = `${notificationKey}Title`;
    const messageKey = `${notificationKey}Message`;
    
    const title = messages.notifications[titleKey];
    let message = messages.notifications[messageKey];

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        message = message.replace(new RegExp(`{${key}}`, 'g'), escapeHtml(value));
      }
    }

    // 2. Read HTML template
    const templatePath = path.join(process.cwd(), 'src', 'templates', `notification_${locale}.html`);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // 3. Replace variables
    htmlContent = htmlContent
      .replace(/{{title}}/g, title)
      .replace(/{{name}}/g, escapeHtml(user.name || 'User'))
      .replace(/{{message}}/g, message);

    // 4. Send email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: `Shhh Security Alert: ${title}`,
      html: htmlContent,
    });

    console.log(`[Notification] Sent "${title}" to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`[Notification] Failed to send email to user ${userId}:`, error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  locale: string = 'en'
): Promise<boolean> {
  try {
    const messages = locale === 'ar' ? arMessages : enMessages;
    const subject = messages.notifications['welcomeSubject'];

    // Read HTML template
    const templatePath = path.join(process.cwd(), 'src', 'templates', `welcome_${locale}.html`);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace variables
    htmlContent = htmlContent
      .replace(/{{name}}/g, escapeHtml(name));

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log(`[Notification] Sent welcome email to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Notification] Failed to send welcome email to ${email}:`, error);
    return false;
  }
}

