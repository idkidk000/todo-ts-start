import type { ComponentProps, ComponentPropsWithoutRef, ElementType, RefObject } from 'react';

import { cn } from '@/lib/utils';

const core = 'transition-colors inline-flex gap-1 items-center font-semibold justify-center cursor-pointer';

const base = 'rounded-md shadow-sm border-2';

const variants = {
  primary: [
    core,
    base,
    'border-transparent bg-primary hover:bg-primary/75 active:bg-primary/50 disabled:bg-primary/25 disabled:text-dark/75 text-primary-contrast',
  ],
  danger: [
    core,
    base,
    'border-transparent bg-danger hover:bg-danger/75 active:bg-danger/50 disabled:bg-danger/25 disabled:text-dark/75 text-danger-contrast',
  ],
  warning: [
    core,
    base,
    'border-transparent bg-warning hover:bg-warning/75 active:bg-warning/50 disabled:bg-warning/25 disabled:text-dark/75 text-warning-contrast',
  ],
  success: [
    core,
    base,
    'border-transparent bg-success hover:bg-success/75 active:bg-success/50 disabled:bg-success/25 disabled:text-dark/75 text-success-contrast',
  ],
  muted: [
    core,
    base,
    'border-foreground/10 bg-muted hover:bg-muted/75 active:bg-muted/50 disabled:bg-muted/25 disabled:text-foreground/75 text-muted-contrast',
  ],
  ghost: [core],
} as const;

export type ButtonVariant = keyof typeof variants;

const sizes = {
  sm: 'px-2 py-1 text-sm *:[svg]:size-4',
  md: 'px-4 py-1 *:[svg]:size-4',
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
    <Component type='button' className={cn(sizes[size], variants[variant], className)} {...props}>
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
