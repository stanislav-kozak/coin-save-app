import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/shared/i18n/routing';
import { AppProviders } from '@/shared/providers/app-providers';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CoinSaveKeeper',
  // Home-screen app on iPhone (the icon is app/apple-icon.tsx).
  appleWebApp: { capable: true, title: 'CoinSave', statusBarStyle: 'default' },
};

// Edge-to-edge on phones; the header and bottom nav pad themselves by the safe-area insets.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Browser and installed-app chrome: the design system's `bg` per colour scheme.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfbf9' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
