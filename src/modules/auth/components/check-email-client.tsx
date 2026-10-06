'use client';

import dynamic from 'next/dynamic';

// The server has no sessionStorage; rendering CheckEmail there would mismatch on hydration.
export const CheckEmailClient = dynamic(() => import('./check-email').then((m) => m.CheckEmail), {
  ssr: false,
});
