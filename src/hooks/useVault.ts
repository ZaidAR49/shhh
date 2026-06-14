'use client';

import { useState, useCallback } from 'react';
import type { Secret, CreateSecretPayload, UpdateSecretPayload } from '@/types';
import { toast } from 'sonner';

interface UseVaultReturn {
  secrets: Secret[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadSecrets: () => Promise<void>;
  loadMoreSecrets: () => Promise<void>;
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const loadSecrets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both secrets and MFA status in parallel
      const [secretsRes, mfaRes] = await Promise.all([
        fetch('/api/secrets?limit=50&offset=0'),
        fetch('/api/auth/mfa/status')
      ]);
      
      if (!secretsRes.ok) throw new Error('Failed to fetch secrets');
      
      const secretsResult = await secretsRes.json();
      setSecrets(secretsResult.data || []);
      setNextOffset(secretsResult.nextOffset);
      setHasMore(secretsResult.nextOffset !== null);

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

  const loadMoreSecrets = useCallback(async () => {
    if (!hasMore || isLoadingMore || nextOffset === null) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/secrets?limit=50&offset=${nextOffset}`);
      if (!res.ok) throw new Error('Failed to fetch more secrets');
      const result = await res.json();
      setSecrets(prev => [...prev, ...(result.data || [])]);
      setNextOffset(result.nextOffset);
      setHasMore(result.nextOffset !== null);
    } catch (e) {
      setError('errors.networkError');
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextOffset]);

  const createSecret = useCallback(async (payload: CreateSecretPayload): Promise<Secret> => {
    const res = await fetch('/api/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.error || 'Failed to create secret';
      toast.error(message);
      throw new Error(message);
    }
    const newSecret = await res.json();
    setSecrets((prev) => [newSecret, ...prev]);
    toast.success('Secret created successfully');
    return newSecret;
  }, []);

  const updateSecret = useCallback(
    async (id: string, payload: UpdateSecretPayload): Promise<Secret> => {
      const res = await fetch(`/api/secrets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.error || 'Failed to update secret';
        toast.error(message);
        throw new Error(message);
      }
      const updated = await res.json();
      setSecrets((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Secret updated successfully');
      return updated;
    },
    []
  );

  const deleteSecret = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/secrets/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.error || 'Failed to delete secret';
      toast.error(message);
      throw new Error(message);
    }
    setSecrets((prev) => prev.filter((s) => s.id !== id));
    toast.success('Secret deleted successfully');
  }, []);

  const searchSecrets = useCallback(async (query: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/secrets?q=${encodeURIComponent(query)}&limit=50&offset=0`);
      if (!res.ok) throw new Error('Failed to search secrets');
      const result = await res.json();
      setSecrets(result.data || []);
      setNextOffset(result.nextOffset);
      setHasMore(result.nextOffset !== null);
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
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.error || 'Failed to toggle favorite';
      toast.error(message);
      throw new Error(message);
    }
    const updated = await res.json();
    setSecrets((prev) => prev.map((s) => (s.id === id ? updated : s)));
    toast.success(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites');
  }, []);

  return {
    secrets,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadSecrets,
    loadMoreSecrets,
    createSecret,
    updateSecret,
    deleteSecret,
    searchSecrets,
    toggleFavorite,
    mfaEnabled,
  };
}
