import { cn } from '@/shared/lib/utils';
import { spaceColor } from '../lib/space-color';

type Props = { space: { id: string; name: string }; size?: 'm' | 's' };

export function SpaceAvatar({ space, size = 'm' }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-primary-foreground',
        size === 'm' ? 'size-10 text-body' : 'size-8 text-caption',
        spaceColor(space.id),
      )}
    >
      {space.name.trim().charAt(0).toLocaleUpperCase()}
    </span>
  );
}
