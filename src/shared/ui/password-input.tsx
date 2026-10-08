'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';
import { Input } from './input';

/** A password field with an eye to check what was typed (handy on a phone). */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const t = useTranslations('common');
  const [shown, setShown] = useState(false);
  const Icon = shown ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input {...props} type={shown ? 'text' : 'password'} className={cn('pr-11', className)} />
      <button
        type="button"
        aria-pressed={shown}
        aria-label={shown ? t('hidePassword') : t('showPassword')}
        onClick={() => setShown((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-control text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Icon aria-hidden className="size-4" />
      </button>
    </div>
  );
}
