import { cn } from '@/shared/lib/utils';
import { BrandMark } from './brand-mark';

/** Whole-page loading (opening the app, switching spaces): the mark drawing itself, not a blank page. */
export function BrandLoader({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn('flex flex-1 items-center justify-center py-24', className)}
    >
      <span className="sr-only">{label}</span>
      <BrandMark size={56} motion="loop" />
    </div>
  );
}
