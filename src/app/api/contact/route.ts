import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Read the HTML templates
    const adminTemplatePath = path.join(process.cwd(), 'src', 'templates', 'contact.html');
    let adminHtmlContent = fs.readFileSync(adminTemplatePath, 'utf8');

    const autoReplyTemplatePath = path.join(process.cwd(), 'src', 'templates', 'auto-reply.html');
    let autoReplyHtmlContent = fs.readFileSync(autoReplyTemplatePath, 'utf8');

    // Replace placeholders for Admin email
    adminHtmlContent = adminHtmlContent
      .replace(/{{name}}/g, name)
      .replace(/{{email}}/g, email)
      .replace(/{{subject}}/g, subject)
      .replace(/{{message}}/g, message);

    // Replace placeholders for Auto-Reply email
    autoReplyHtmlContent = autoReplyHtmlContent
      .replace(/{{name}}/g, name)
      .replace(/{{subject}}/g, subject);

    // 1. Send the email to the Admin
    const adminMailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: adminHtmlContent,
    };

    // 2. Send the auto-reply to the User
    const autoReplyMailOptions = {
      from: process.env.EMAIL,
      to: email, // Send to the user who filled out the form
      subject: `Thank you for contacting Shhh - We've received your message`,
      html: autoReplyHtmlContent,
    };

    // Send both emails simultaneously
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(autoReplyMailOptions)
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
