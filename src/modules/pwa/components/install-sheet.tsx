'use client';

import {
  CircleCheck,
  EllipsisVertical,
  MonitorDown,
  Share,
  SquarePlus,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import type { Platform } from '../lib/platform';

type Step = { icon: LucideIcon; key: StepKey };
type StepKey =
  | 'ios.share'
  | 'ios.add'
  | 'ios.confirm'
  | 'android.menu'
  | 'android.install'
  | 'mac.dock'
  | 'desktop.addressBar';

const STEPS: Record<Exclude<Platform, 'unsupported'>, Step[]> = {
  ios: [
    { icon: Share, key: 'ios.share' },
    { icon: SquarePlus, key: 'ios.add' },
    { icon: CircleCheck, key: 'ios.confirm' },
  ],
  android: [
    { icon: EllipsisVertical, key: 'android.menu' },
    { icon: SquarePlus, key: 'android.install' },
  ],
  'desktop-safari': [{ icon: Share, key: 'mac.dock' }],
  desktop: [{ icon: MonitorDown, key: 'desktop.addressBar' }],
};

/** How to install where the browser has no install dialog to show (iPhone Safari above all). */
export function InstallSheet({
  platform,
  open,
  onOpenChange,
}: {
  platform: Platform;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('pwa.sheet');
  const tc = useTranslations('common');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('title')} closeLabel={tc('close')}>
        {platform === 'unsupported' ? (
          <p className="text-body text-muted-foreground">{t('unsupported')}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <ol className="flex flex-col gap-3">
              {STEPS[platform].map(({ icon: Icon, key }, i) => (
                <li key={key} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border bg-background text-primary">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="text-body">{t(key)}</span>
                </li>
              ))}
            </ol>
            {platform === 'ios' ? (
              <p className="text-caption text-muted-foreground">{t('ios.note')}</p>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
