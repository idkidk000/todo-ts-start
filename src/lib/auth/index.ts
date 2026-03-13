import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { authClient } from '@/lib/auth/client';
import { auth } from '@/lib/auth/server';

export const getSession = createIsomorphicFn()
  .client(() => authClient.getSession())
  .server(async () => {
    try {
      const data = await auth.api.getSession({ headers: await getRequestHeaders() });
      return { data };
    } catch (error) {
      console.error(error);
      return { error: JSON.parse(JSON.stringify(error)) };
    }
  });

export const getSessionOrThrow = createIsomorphicFn()
  .client(async () => {
    const session = await authClient.getSession();
    if (session.data?.session && session.data?.user) return session.data;
    throw new Error(session.error?.message ?? session.error?.statusText ?? 'unknown error');
  })
  .server(async () => {
    const session = await auth.api.getSession({ headers: await getRequestHeaders() });
    if (session?.session && session.user) return session;
    throw new Error('unknown error');
  });
