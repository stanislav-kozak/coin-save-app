import type { MetadataRoute } from 'next';

/**
 * Web app manifest (`/manifest.webmanifest`): makes CoinSave installable. Colours are the design
 * system's light `bg` and accent; icons come from docs/superpowers/pwa-icons.mjs. The screenshots
 * (Chrome's richer install sheet) reuse the onboarding images.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'CoinSaveKeeper',
    short_name: 'CoinSave',
    description: 'A shared family budget: wallets, categories, limits and recurring payments.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fdfbf9',
    theme_color: '#f97350',
    categories: ['finance', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      ...['01', '05'].map((n) => ({
        src: `/onboarding/mobile/en/light/${n}.webp`,
        sizes: '780x960',
        type: 'image/webp',
        form_factor: 'narrow' as const,
      })),
      ...['01', '08'].map((n) => ({
        src: `/onboarding/desktop/en/light/${n}.webp`,
        sizes: '1200x750',
        type: 'image/webp',
        form_factor: 'wide' as const,
      })),
    ],
  };
}
