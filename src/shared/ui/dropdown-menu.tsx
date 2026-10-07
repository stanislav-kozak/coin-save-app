'use client';

import { Check } from 'lucide-react';
import { DropdownMenu as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-56 rounded-card border border-border bg-popover p-2 text-popover-foreground shadow-modal',
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-control px-2 py-2 text-body outline-none select-none data-[highlighted]:bg-accent',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      className={cn('px-2 py-1.5 text-caption text-muted-foreground', className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn('my-2 h-px bg-border', className)} {...props} />;
}

/** A menu item with a check box (multi-select filters); keeps the menu open on toggle by default. */
export function DropdownMenuCheckboxItem({
  className,
  children,
  onSelect,
  ...props
}: ComponentProps<typeof Primitive.CheckboxItem>) {
  return (
    <Primitive.CheckboxItem
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-control px-2 py-2 text-body outline-none select-none data-[highlighted]:bg-accent',
        className,
      )}
      onSelect={(e) => {
        e.preventDefault(); // stay open: several wallets are picked in a row
        onSelect?.(e);
      }}
      {...props}
    >
      <span
        aria-hidden
        className="flex size-4 items-center justify-center rounded-sm border border-border"
      >
        <Primitive.ItemIndicator>
          <Check className="size-3" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}
