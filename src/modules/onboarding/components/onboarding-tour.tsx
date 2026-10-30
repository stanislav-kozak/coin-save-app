'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { useIsDesktop } from '@/shared/hooks/use-is-desktop';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { IMAGE_SIZE, SLIDES, slideImage } from '../lib/slides';

const SWIPE_PX = 50;

type Props = {
  open: boolean;
  /** Called on finish, skip and close alike: each one counts as having seen the tour. */
  onClose: () => void;
};

/**
 * The illustrated tour: real screenshots with a short text, a phone set on mobile and a desktop
 * set from `md` up. Arrow keys (desktop) and swipes (mobile) change slides.
 */
export function OnboardingTour({ open, onClose }: Props) {
  const isDesktop = useIsDesktop();
  const device = isDesktop ? 'desktop' : 'mobile';
  const t = useTranslations('onboarding');
  const td = useTranslations('onboarding.desktop');
  const tm = useTranslations('onboarding.mobile');
  const tc = useTranslations('common');
  const locale = useLocale();
  const theme = useTheme().resolvedTheme === 'dark' ? 'dark' : 'light';
  const slides = SLIDES[device];
  const [index, setIndex] = useState(0);
  const swipeFrom = useRef<number | null>(null);
  const last = index === slides.length - 1;
  const copy = (field: 'title' | 'text' | 'alt') =>
    isDesktop ? td(`${SLIDES.desktop[index]!}.${field}`) : tm(`${SLIDES.mobile[index]!}.${field}`);

  const go = (to: number) => setIndex(Math.max(0, Math.min(slides.length - 1, to)));
  const next = () => (last ? onClose() : go(index + 1));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(slides.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, slides.length]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={copy('title')} closeLabel={tc('close')} wide>
        <div className="flex flex-col gap-4">
          <div
            className="touch-pan-y select-none"
            onPointerDown={(e) => (swipeFrom.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipeFrom.current === null) return;
              const dx = e.clientX - swipeFrom.current;
              swipeFrom.current = null;
              if (dx <= -SWIPE_PX) go(index + 1);
              if (dx >= SWIPE_PX) go(index - 1);
            }}
          >
            <Image
              key={`${device}-${index}`}
              src={slideImage(device, locale, theme, index)}
              alt={copy('alt')}
              {...IMAGE_SIZE[device]}
              sizes="(min-width: 768px) 672px, 100vw"
              priority
              draggable={false}
              className="h-auto w-full rounded-card border border-border motion-safe:animate-row-in"
            />
          </div>
          <p className="text-body text-muted-foreground" aria-live="polite">
            {copy('text')}
          </p>
          <div
            className="flex justify-center gap-2"
            aria-label={t('step', { n: index + 1, total: slides.length })}
            role="group"
          >
            {slides.map((s, i) => (
              <button
                key={s}
                type="button"
                aria-label={t('goTo', { n: i + 1 })}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => go(i)}
                className={cn(
                  'h-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-safe:transition-[width,background-color]',
                  i === index ? 'w-6 bg-primary' : 'w-2 bg-border',
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {last ? null : (
              <button
                type="button"
                onClick={onClose}
                className="text-caption font-medium text-muted-foreground hover:text-foreground"
              >
                {t('skip')}
              </button>
            )}
            <div className="ml-auto flex gap-2">
              {index > 0 ? (
                <Button variant="ghost" onClick={() => go(index - 1)}>
                  {t('back')}
                </Button>
              ) : null}
              <Button onClick={next}>{last ? t('start') : t('next')}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
