import { createIsomorphicFn } from '@tanstack/react-start';
import { authClient } from '@/lib/auth/client';
import { auth } from '@/lib/auth/server';

export const getSession = createIsomorphicFn()
  .client(() => authClient.getSession())
  .server(async () => {
    try {
      const data = await auth.api.getSession();
      return { data };
    } catch (error) {
      return {
        error: JSON.parse(JSON.stringify(error)),
      };
    }
  });
