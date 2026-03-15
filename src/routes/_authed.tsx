import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Nav } from '@/components/nav';
import { DataProvider } from '@/hooks/data';
import { getSessionOrThrow } from '@/lib/better-auth';
import { todoWithCompletedAtSelect } from '@/lib/todos';

// runs for everything under the virtual route /_authed
// the actual urls do not contain /_authed
export const Route = createFileRoute('/_authed')({
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
    return await todoWithCompletedAtSelect();
  },
  component: AuthedComponent,
});

const queryClient = new QueryClient();

function AuthedComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthedDocument>
        <Outlet />
      </AuthedDocument>
    </QueryClientProvider>
  );
}

function AuthedDocument({ children }: Readonly<{ children: ReactNode }>) {
  const initialTodos = Route.useLoaderData();

  return (
    <DataProvider initialTodos={initialTodos}>
      <Nav />
      {children}
    </DataProvider>
  );
}
