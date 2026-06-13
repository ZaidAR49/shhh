import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { UserService } from '@/lib/services/user.service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userStatus = await UserService.getMfaStatus(session.user.id);
    if (userStatus?.mfaEnabled) {
      return NextResponse.json({ error: 'MFA is already enabled. Disable it first to set up a new device.' }, { status: 400 });
    }

    // Generate a secure secret for the user (20 bytes for strict authenticator compatibility)
    const secret = generateSecret({ length: 20 });

    // Create the provisioning URI for Google/Microsoft Authenticator
    const baseOtpauthUrl = generateURI({
      label: session.user.email,
      issuer: 'Shhh App', // Your app name
      secret
    });
    const otpauthUrl = `${baseOtpauthUrl}&image=${encodeURIComponent(`${process.env.NEXT_PUBLIC_DOMAIN}/icon.png`)}`

    // Save the generated secret to the DB as pending
    await UserService.setPendingMfaSecret(session.user.id, secret);

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
