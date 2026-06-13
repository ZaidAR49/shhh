'use client';

import { SecretCard } from './SecretCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Secret } from '@/types';

interface SecretGridProps {
  secrets: Secret[];
  isLoading: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function SecretCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3.5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SecretGrid({ secrets, isLoading, onView, onEdit, onDelete }: SecretGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SecretCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {secrets.map((secret) => (
        <SecretCard 
          key={secret.id} 
          secret={secret} 
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
