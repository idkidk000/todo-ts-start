import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { getSession as getSessionClient } from '@/lib/better-auth/client';
import { getSession as getSessionServer } from '@/lib/better-auth/server';

export const getSessionOrThrow = createIsomorphicFn()
  .client(async () => {
    const session = await getSessionClient();
    if (session.data?.session && session.data?.user) return session.data;
    throw new Error(session.error?.message ?? session.error?.statusText ?? 'unknown error');
  })
  .server(async () => {
    const session = await getSessionServer({ headers: await getRequestHeaders() });
    if (session?.session && session.user) return session;
    throw new Error('unknown error');
  });
