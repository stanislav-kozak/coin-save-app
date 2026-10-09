import { useQueries, useQuery } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';

type Currency = components['schemas']['Currency'];

const rateQuery = (from: Currency, to: Currency) => ({
  queryKey: ['rate', from, to],
  queryFn: async () => {
    const { data, error } = await api.GET('/api/currencies/rate', {
      params: { query: { from, to } },
    });
    if (error) throw error;
    return data;
  },
  enabled: from !== to,
  staleTime: 10 * 60_000,
});

/** Today's rate `from` → `to` (the one the server converts with); nothing is fetched for one currency. */
export function useRate(from: Currency, to: Currency) {
  return useQuery(rateQuery(from, to));
}

/**
 * Today's rates of several currencies into `to` (shared cache with `useRate`): the rates by currency,
 * whether any is still loading, and which ones failed.
 */
export function useRates(from: Currency[], to: Currency) {
  const results = useQueries({ queries: from.map((c) => rateQuery(c, to)) });
  const rates = new Map<Currency, string>();
  const failed: Currency[] = [];
  results.forEach((r, i) => {
    if (r.data) rates.set(from[i]!, r.data.rate);
    else if (r.isError) failed.push(from[i]!);
  });
  return { rates, failed, pending: results.some((r) => r.isPending && r.fetchStatus !== 'idle') };
}
