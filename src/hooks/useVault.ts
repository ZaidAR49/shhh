'use client';

import { useState, useCallback } from 'react';
import { mockApi } from '@/lib/mock-api';
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
}

/**
 * Vault data hook — all CRUD operations via mockApi.
 * Replace mockApi calls with real fetch() when wiring backend.
 */
export function useVault(): UseVaultReturn {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSecrets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mockApi.getSecrets();
      setSecrets(data);
    } catch (e) {
      setError('errors.networkError');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSecret = useCallback(async (payload: CreateSecretPayload): Promise<Secret> => {
    const newSecret = await mockApi.createSecret(payload);
    setSecrets((prev) => [newSecret, ...prev]);
    return newSecret;
  }, []);

  const updateSecret = useCallback(
    async (id: string, payload: UpdateSecretPayload): Promise<Secret> => {
      const updated = await mockApi.updateSecret(id, payload);
      setSecrets((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    []
  );

  const deleteSecret = useCallback(async (id: string): Promise<void> => {
    await mockApi.deleteSecret(id);
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const searchSecrets = useCallback(async (query: string): Promise<void> => {
    setIsLoading(true);
    try {
      const results = await mockApi.searchSecrets(query);
      setSecrets(results);
    } catch (e) {
      setError('errors.networkError');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    const updated = await mockApi.toggleFavorite(id);
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
  };
}
