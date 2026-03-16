/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import '@/styles.css';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Todos' },
    ],
  }),
  component: RootComponent,
  notFoundComponent(props) {
    console.error('not found', JSON.stringify(props));
  },
});

const queryClient = new QueryClient();

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <TanStackDevtools
          plugins={[
            {
              name: 'Form',
              render: <FormDevtoolsPanel />,
            },
            {
              name: 'Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Query',
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
      </QueryClientProvider>
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
        <div className='flex flex-col gap-4 p-4 min-h-dvh'>{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
