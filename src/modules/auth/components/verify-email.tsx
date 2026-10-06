'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/i18n/navigation';
import { api } from '@/shared/lib/api-client';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { StatusPanel } from './status-panel';

export function VerifyEmail({ token }: { token: string | null }) {
  const t = useTranslations('auth.verify');
  const te = useTranslations('errors');

  // A token works once. useQuery (not a mutation fired from an effect) dedupes by key, so
  // StrictMode's double mount and re-renders never POST twice; it is never refetched.
  const verify = useQuery({
    queryKey: ['verify-email', token],
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data, error } = await api.POST('/api/auth/verify-email', {
        body: { token: token! },
      });
      if (error) throw error;
      return data ?? {};
    },
  });

  const toLogin = (
    <Button asChild className="mt-3 w-full">
      <Link href="/login">{t('toLogin')}</Link>
    </Button>
  );

  if (!token || verify.isError) {
    return (
      <StatusPanel icon="error" title={t('errorTitle')}>
        <p className="text-body text-muted-foreground">
          {te(token ? getErrorCode(verify.error) : 'INVALID_VERIFICATION_TOKEN')}
        </p>
        {toLogin}
      </StatusPanel>
    );
  }
  if (verify.isPending) return <StatusPanel icon="pending" title={t('pending')} />;
  return (
    <StatusPanel icon="success" title={t('successTitle')}>
      <p className="text-body text-muted-foreground">{t('successText')}</p>
      {toLogin}
    </StatusPanel>
  );
}
