'use client';

import { useState, useCallback } from 'react';
import type { Secret, CreateSecretPayload, UpdateSecretPayload } from '@/types';

interface UseVaultReturn {
  secrets: Secret[];
  isLoading: boolean;
  error: string | null;
  loadSecrets: () => Promise<void>;
  createSecret: (payload: CreateSecretPayload) => Promise<Secret>;
  updateSecret: (id: string, payload: UpdateSecretPayload) => Promise<Secret>;
  deleteSecret: (id: string) => Promise<void>;
  searchSecrets: (query: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  mfaEnabled: boolean;
}

export function useVault(): UseVaultReturn {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const loadSecrets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both secrets and MFA status in parallel
      const [secretsRes, mfaRes] = await Promise.all([
        fetch('/api/secrets'),
        fetch('/api/auth/mfa/status')
      ]);
      
      if (!secretsRes.ok) throw new Error('Failed to fetch secrets');
      
      const secretsData = await secretsRes.json();
      setSecrets(secretsData);

      if (mfaRes.ok) {
        const mfaData = await mfaRes.json();
        setMfaEnabled(mfaData.mfaEnabled || false);
      }
    } catch (e) {
      setError('errors.networkError');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSecret = useCallback(async (payload: CreateSecretPayload): Promise<Secret> => {
    const res = await fetch('/api/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create secret');
    const newSecret = await res.json();
    setSecrets((prev) => [newSecret, ...prev]);
    return newSecret;
  }, []);

  const updateSecret = useCallback(
    async (id: string, payload: UpdateSecretPayload): Promise<Secret> => {
      const res = await fetch(`/api/secrets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update secret');
      const updated = await res.json();
      setSecrets((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    []
  );

  const deleteSecret = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/secrets/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete secret');
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const searchSecrets = useCallback(async (query: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/secrets?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search secrets');
      const results = await res.json();
      setSecrets(results);
    } catch (e) {
      setError('errors.networkError');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/secrets/${id}/favorite`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    const updated = await res.json();
    setSecrets((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  return {
    secrets,
    isLoading,
    error,
    loadSecrets,
    createSecret,
    updateSecret,
    deleteSecret,
    searchSecrets,
    toggleFavorite,
    mfaEnabled,
  };
}
