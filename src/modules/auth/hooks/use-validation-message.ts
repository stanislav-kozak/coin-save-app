import { useTranslations } from 'next-intl';

type ValidationKey = Parameters<ReturnType<typeof useTranslations<'auth.validation'>>>[0];

/** Translates a zod issue message (a key of auth.validation). */
export function useValidationMessage() {
  const t = useTranslations('auth.validation');
  return (key?: string) => (key ? t(key as ValidationKey) : undefined);
}
