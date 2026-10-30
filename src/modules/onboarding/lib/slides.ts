export type Device = 'desktop' | 'mobile';

/** Message keys under `onboarding.<device>`; the order is the order of the screenshots. */
export const SLIDES = {
  desktop: [
    'welcome',
    'wallets',
    'drag',
    'recent',
    'categories',
    'income',
    'recurring',
    'analytics',
    'together',
  ],
  mobile: [
    'welcome',
    'wallets',
    'drag',
    'plus',
    'categories',
    'income',
    'recurring',
    'analytics',
    'together',
  ],
} as const;

/** Screenshot size per device (desktop 1440×900 scaled down, mobile a 390×480 crop at 2×). */
export const IMAGE_SIZE: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1200, height: 750 },
  mobile: { width: 780, height: 960 },
};

/** `public/onboarding/…`, made by docs/superpowers/onboarding-capture.js (Playwright). */
export function slideImage(
  device: Device,
  locale: string,
  theme: 'light' | 'dark',
  index: number,
): string {
  return `/onboarding/${device}/${locale === 'uk' ? 'uk' : 'en'}/${theme}/${String(index + 1).padStart(2, '0')}.webp`;
}
