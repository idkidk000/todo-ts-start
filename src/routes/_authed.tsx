import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSessionOrThrow } from '@/lib/better-auth';

// runs for everything under the virtual route /_authed
// the actual urls do not contain /_authed
export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    try {
      const session = await getSessionOrThrow();
      console.info('authed', session);
    } catch (error) {
      console.error('not authed', error);
      throw redirect({ to: '/' });
    }
  },
});
