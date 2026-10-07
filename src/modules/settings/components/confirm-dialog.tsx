'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { getErrorCode } from '@/shared/lib/api-error';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';

type Props = {
  title: string;
  text: string;
  confirmLabel: string;
  /** Shown on the button while the action runs (slow server work, e.g. re-converting history). */
  busyLabel?: string;
  tone?: 'danger';
  /** Extra content (e.g. "type the name") that can hold the confirm button back. */
  children?: ReactNode;
  canConfirm?: boolean;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
};

/** Ask before an irreversible or disruptive action; a refusal stays visible in the dialog. */
export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  busyLabel,
  tone,
  children,
  canConfirm = true,
  onConfirm,
  onClose,
}: Props) {
  const t = useTranslations('settings');
  const te = useTranslations('errors');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent title={title} closeLabel={t('close')}>
        <div className="flex flex-col gap-4">
          <p className="text-body text-foreground">{text}</p>
          {children}
          {error ? (
            <p role="alert" className="text-caption text-destructive">
              {te(getErrorCode(error))}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              disabled={busy || !canConfirm}
              onClick={() => void confirm()}
            >
              {busy && busyLabel ? busyLabel : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
