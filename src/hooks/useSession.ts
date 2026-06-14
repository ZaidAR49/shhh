'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession as useNextAuthSession, signIn, signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import type { Session } from '@/types';

interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  minutesRemaining: number;
  isExpired: boolean;
  unlock: () => Promise<void>;
  lock: () => void;
  updateName: (name: string) => void;
}

export function useSession(): UseSessionReturn {
  const { data: authSession, status, update } = useNextAuthSession();
  const locale = useLocale();
  const [minutesRemaining, setMinutesRemaining] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLoading = status === 'loading';

  const mappedSession: Session | null = authSession ? {
    user: {
      id: (authSession.user as any)?.id || '',
      name: authSession.user?.name || '',
      email: authSession.user?.email || '',
      image: authSession.user?.image || undefined,
      provider: 'google'
    },
    expires_at: authSession.expires,
    created_at: new Date(Date.now() - 3600000).toISOString(), // Fallback for UI
  } : null;

  useEffect(() => {
    if (mappedSession?.user) {
      const rememberedUser = {
        name: mappedSession.user.name,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      localStorage.setItem('shhh_remembered_user', JSON.stringify(rememberedUser));
    }

    if (!mappedSession) return;

    const calcMins = () => {
      const expires = new Date(mappedSession.expires_at).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expires - now) / 60000));
    };

    setMinutesRemaining(calcMins());

    const handleExpiry = () => {
      const mins = calcMins();
      setMinutesRemaining(mins);
      if (mins <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        signOut({ callbackUrl: `/${locale}/auth` });
      }
    };

    intervalRef.current = setInterval(handleExpiry, 10_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authSession, locale]);

  const unlock = async () => {
    await signIn('google');
  };

  const lock = () => {
    localStorage.removeItem('shhh_remembered_user');
    signOut({ callbackUrl: `/${locale}/auth` });
  };

  const updateName = async (name: string) => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        // Update local storage so the unlock screen gets the new name immediately
        const stored = localStorage.getItem('shhh_remembered_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.name = name;
            localStorage.setItem('shhh_remembered_user', JSON.stringify(parsed));
          } catch (e) {}
        }
        toast.success('Name updated successfully');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update name');
      }
    } catch (e) {
      console.error("Failed to update name", e);
      toast.error('Network error while updating name');
    }
  };

  return {
    session: mappedSession,
    isLoading,
    minutesRemaining,
    isExpired: mappedSession ? minutesRemaining <= 0 : false,
    unlock,
    lock,
    updateName,
  };
}
