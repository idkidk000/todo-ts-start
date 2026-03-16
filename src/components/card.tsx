import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Card({ title, children, className }: ComponentProps<'article'> & { title: string }) {
  return (
    <article className={cn('flex flex-col gap-4 rounded-md border border-border p-4 shadow-md slide-in-up', className)}>
      <h2>{title}</h2>
      {children}
    </article>
  );
}
