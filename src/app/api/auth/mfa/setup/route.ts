import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure secret for the user
    const secret = generateSecret();

    // Create the provisioning URI for Google/Microsoft Authenticator
    const otpauthUrl = generateURI({
      label: session.user.email,
      issuer: 'Shhh App', // Your app name
      secret
    });

    // Generate a QR code from the URI
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Return the secret and QR code to the client
    // We DO NOT save this to the DB yet. We wait for them to confirm it works.
    return NextResponse.json({
      secret,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error('Error generating MFA setup:', error);
    return NextResponse.json(
      { error: 'Failed to generate MFA setup' },
      { status: 500 }
    );
  }
}
