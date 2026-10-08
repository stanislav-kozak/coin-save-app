import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import en from '@/shared/i18n/messages/en.json';
import uk from '@/shared/i18n/messages/uk.json';

export function renderWithProviders(ui: ReactElement, { locale = 'uk' as 'uk' | 'en' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const result = render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'uk' ? uk : en}
      timeZone="Europe/Kyiv"
    >
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
  return { ...result, queryClient };
}
