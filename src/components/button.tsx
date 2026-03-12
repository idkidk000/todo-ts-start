import type { ComponentProps, ComponentPropsWithoutRef, ElementType, RefObject } from 'react';
import { cn } from '@/lib/utils';

const base =
  'rounded-md shadow-md transition-colors border-2 inline-flex gap-1 items-center font-semibold justify-center';

const variants = {
  primary:
    'border-transparent bg-primary hover:bg-primary/75 active:bg-primary/50 disabled:bg-primary/25 disabled:text-dark/75 text-primary-contrast',
  danger:
    'border-transparent bg-danger hover:bg-danger/75 active:bg-danger/50 disabled:bg-danger/25 disabled:text-dark/75 text-danger-contrast',
  warning:
    'border-transparent bg-warning hover:bg-warning/75 active:bg-warning/50 disabled:bg-warning/25 disabled:text-dark/75 text-warning-contrast',
  success:
    'border-transparent bg-success hover:bg-success/75 active:bg-success/50 disabled:bg-success/25 disabled:text-dark/75 text-success-contrast',
  muted:
    'border-foreground/10 bg-background-card hover:bg-background-card/75 active:bg-background-card/50 disabled:bg-background-card/25 disabled:text-foreground/75 text-foreground',
  ghost: 'border-foreground/10',
} as const;

export type ButtonVariant = keyof typeof variants;

const sizes = {
  sm: 'px-2 text-sm *:[svg]:size-4',
  md: 'px-4 py-2 *:[svg]:size-4',
  lg: 'px-4 py-2 *:[svg]:size-6',
  icon: 'p-2 *:[svg]:size-6',
} as const;

export type ButtonSize = keyof typeof sizes;

export function Button<T extends ElementType = 'button'>({
  children,
  className,
  size = 'md',
  variant = 'primary',
  as,
  ...props
}: ComponentPropsWithoutRef<T> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
  as?: T;
  ref?: RefObject<HTMLElement | null>;
}) {
  const Component = as ?? 'button';
  return (
    <Component type='button' className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}

export function ButtonGroup({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '*:not-first:border-s *:not-last:border-e *:not-first:rounded-s-none *:not-last:rounded-e-none flex',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
