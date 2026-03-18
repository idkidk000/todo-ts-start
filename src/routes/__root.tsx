/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import '@/styles.css';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Nav } from '@/components/nav';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // don't mark stale after some timeout
      staleTime: Infinity,
      // these options are actually refetch on x **if stale** (i.e. they were inactive then were invalidated via sse)
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
    },
  },
});

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
      <body className='grid grid-rows-[auto_1fr] min-h-dvh max-h-dvh overflow-hidden'>
        <Nav />
        <main className='flex flex-col gap-4 px-4 pb-4 h-full overflow-y-auto snap-y'>{children}</main>
        <Scripts />
      </body>
    </html>
  );
}
