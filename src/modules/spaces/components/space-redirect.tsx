'use client';

import { useEffect } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import { useSpaces } from '../api/spaces-queries';
import { lastSpace, pickLandingSpace } from '../lib/last-space';

/**
 * `/[locale]`: opens the last (or first) space, or onboarding when there is none.
 * Its authenticated request also catches a dead session (→ refresh fails → login).
 */
export function SpaceRedirect() {
  const router = useRouter();
  const spaces = useSpaces();

  useEffect(() => {
    if (!spaces.data) return;
    const id = pickLandingSpace(spaces.data, lastSpace.get());
    router.replace(id ? `/s/${id}` : '/onboarding');
  }, [spaces.data, router]);

  return null;
}
