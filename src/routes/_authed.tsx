// routes/_authed.tsx - Layout route for protected pages

import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '@/lib/auth';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSession();
    console.log('_authed', session);
    if (!session.data) throw redirect({ to: '/' });
    return { user: session.data.user, session: session.data.session };
  },
});
