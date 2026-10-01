import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = { title: 'CoinSave' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="uk" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
