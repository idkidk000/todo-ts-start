import type { ReactNode } from 'react';

export function Card({ title, children }: { title: string; children: ReactNode; className?: string }) {
  return (
    <article className='flex flex-col gap-4 border rounded-md p-2'>
      <h2>{title}</h2>
      {children}
    </article>
  );
}
