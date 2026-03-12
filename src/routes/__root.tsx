/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import '@/styles.css';
import { Nav } from '@/components/nav';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Todos',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className='flex flex-col gap-4 p-4'>
          <Nav />
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
