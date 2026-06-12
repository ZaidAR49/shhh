'use client';

import { useState, useEffect, useRef } from 'react';
import type { Session } from '@/types';
import {
  getStoredSession,
  storeSession,
  clearStoredSession,
  createMockSession,
  getMinutesRemaining,
} from '@/lib/session';

interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  minutesRemaining: number;
  isExpired: boolean;
  unlock: () => Promise<void>;
  lock: () => void;
  updateName: (name: string) => void;
}

/**
 * Mock session hook.
 * Tracks expiry countdown and persists session in localStorage.
 * In production, replace with real auth provider hook.
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minutesRemaining, setMinutesRemaining] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = getStoredSession();
    setSession(stored);
    if (stored) setMinutesRemaining(getMinutesRemaining(stored));
    setIsLoading(false);
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!session) return;

    intervalRef.current = setInterval(() => {
      const mins = getMinutesRemaining(session);
      setMinutesRemaining(mins);
      if (mins <= 0) {
        clearStoredSession();
        setSession(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 10_000); // check every 10 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session]);

  const unlock = async () => {
    setIsLoading(true);
    // Simulate OAuth delay
    await new Promise((r) => setTimeout(r, 800));
    const newSession = createMockSession();
    storeSession(newSession);
    setSession(newSession);
    setMinutesRemaining(getMinutesRemaining(newSession));
    setIsLoading(false);
  };

  const lock = () => {
    clearStoredSession();
    setSession(null);
    setMinutesRemaining(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const updateName = (name: string) => {
    import('@/lib/session').then(({ updateUserName }) => {
      const updatedSession = updateUserName(name);
      if (updatedSession) {
        setSession(updatedSession);
      }
    });
  };

  return {
    session,
    isLoading,
    minutesRemaining,
    isExpired: session ? getMinutesRemaining(session) <= 0 : false,
    unlock,
    lock,
    updateName,
  };
}
