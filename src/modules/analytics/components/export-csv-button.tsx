'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '@/shared/lib/api-client';
import { getErrorCode } from '@/shared/lib/api-error';
import { userTimeZone } from '@/shared/lib/periods';
import { Button } from '@/shared/ui/button';
import type { Period } from '../lib/period';

/**
 * Spec §10.5: the period as CSV. Fetched through the API client (so an expired session refreshes) and
 * saved via an object URL. The endpoint has no wallet filter: the whole period is exported.
 */
export function ExportCsvButton({ spaceId, period }: { spaceId: string; period: Period }) {
  const t = useTranslations('analytics.csv');
  const te = useTranslations('errors');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data, error: failed } = await api.GET('/api/spaces/{spaceId}/expenses.csv', {
        params: {
          path: { spaceId },
          query: { from: period.from, to: period.to, tz: userTimeZone() },
        },
        parseAs: 'blob',
      });
      if (failed || !data) throw failed ?? new Error('empty');
      const url = URL.createObjectURL(data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coinsave-${period.from}-${period.to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" disabled={busy} onClick={() => void download()} title={t('hint')}>
        {t('export')}
      </Button>
      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {te(getErrorCode(error))}
        </p>
      ) : null}
    </div>
  );
}
