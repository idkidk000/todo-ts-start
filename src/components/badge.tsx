import type { ComponentPropsWithoutRef, ElementType, RefObject } from 'react';
import { cn } from '@/lib/utils';

const base =
  'transition-colors inline-flex gap-1 items-center font-semibold justify-center rounded-md shadow-sm border-2';

const variants = {
  primary: [
    base,
    'border-transparent bg-primary hover:bg-primary/75 active:bg-primary/50 disabled:bg-primary/25 disabled:text-dark/75 text-primary-contrast',
  ],
  danger: [
    base,
    'border-transparent bg-danger hover:bg-danger/75 active:bg-danger/50 disabled:bg-danger/25 disabled:text-dark/75 text-danger-contrast',
  ],
  warning: [
    base,
    'border-transparent bg-warning hover:bg-warning/75 active:bg-warning/50 disabled:bg-warning/25 disabled:text-dark/75 text-warning-contrast',
  ],
  success: [
    base,
    'border-transparent bg-success hover:bg-success/75 active:bg-success/50 disabled:bg-success/25 disabled:text-dark/75 text-success-contrast',
  ],
  muted: [
    base,
    'border-foreground/10 bg-background-card hover:bg-background-card/75 active:bg-background-card/50 disabled:bg-background-card/25 disabled:text-foreground/75 text-foreground',
  ],
} as const;

export type BadgeVariant = keyof typeof variants;

const sizes = {
  sm: 'px-2 text-sm *:[svg]:size-4',
  md: 'px-4 py-2 *:[svg]:size-4',
  lg: 'px-4 py-2 *:[svg]:size-6',
  icon: 'p-2 *:[svg]:size-6',
} as const;

export type BadgeSize = keyof typeof sizes;

export function Badge<T extends ElementType = 'span'>({
  children,
  className,
  size = 'md',
  variant = 'primary',
  as,
  ...props
}: ComponentPropsWithoutRef<T> & {
  size?: BadgeSize;
  variant?: BadgeVariant;
  as?: T;
  ref?: RefObject<HTMLElement | null>;
}) {
  const Component = as ?? 'span';
  return (
    <Component className={cn(sizes[size], variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}
