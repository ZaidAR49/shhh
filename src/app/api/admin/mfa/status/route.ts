import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies } from 'next/headers';
import { verifyAdminMfaCookie, ADMIN_MFA_COOKIE_NAME } from '@/lib/admin-mfa-cookie';

/**
 * GET /api/admin/mfa/status
 * Returns { verified: true } if the admin_mfa_ok cookie is valid for the current user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ verified: false, reason: 'unauthenticated' });
    }

    const userRole = (session.user as any).role as string | undefined;
    if (!userRole || !['admin', 'supervisor', 'viewer'].includes(userRole)) {
      return NextResponse.json({ verified: false, reason: 'not_admin' });
    }

    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(ADMIN_MFA_COOKIE_NAME)?.value;

    if (!cookieValue) {
      return NextResponse.json({ verified: false, reason: 'no_cookie' });
    }

    const userId = verifyAdminMfaCookie(cookieValue);

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ verified: false, reason: 'invalid_cookie' });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Error checking admin MFA status:', error);
    return NextResponse.json({ verified: false, reason: 'error' });
  }
}
