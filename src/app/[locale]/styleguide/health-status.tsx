'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/shared/lib/api-client';

export function HealthStatus() {
  const t = useTranslations('styleguide');
  const { data, isError, isPending } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/health');
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <p className="text-caption text-muted-foreground">…</p>;
  return (
    <p className={isError ? 'text-destructive' : 'text-success'}>
      {isError ? t('healthDown') : t('healthOk')}
      {data ? (
        <span className="ml-2 text-caption text-muted-foreground">{JSON.stringify(data)}</span>
      ) : null}
    </p>
  );
}
