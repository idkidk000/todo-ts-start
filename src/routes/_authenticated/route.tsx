import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { DataProvider } from '@/hooks/data';
import { getSessionOrThrow } from '@/lib/better-auth';
import { todoSelect } from '@/lib/todos';

// https://tanstack.com/router/latest/docs/routing/routing-concepts#pathless-layout-routes
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    try {
      const session = await getSessionOrThrow();
      console.info('authed', session);
      // available under Route.context
      return session;
    } catch (error) {
      console.error('not authed', error);
      throw redirect({ to: '/' });
    }
  },
  async loader() {
    // available under Route.loaderData
    return await todoSelect();
  },
  component: AuthedComponent,
});

function AuthedComponent() {
  return (
    <AuthedDocument>
      <Outlet />
    </AuthedDocument>
  );
}

function AuthedDocument({ children }: Readonly<{ children: ReactNode }>) {
  const initialTodos = Route.useLoaderData();

  return <DataProvider initialTodos={initialTodos}>{children}</DataProvider>;
}
