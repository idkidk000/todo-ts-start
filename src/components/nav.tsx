import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/button';
import { signOut, useSession } from '@/lib/better-auth/client';

export function Nav() {
  const location = useRouterState({ select: (s) => s.location });
  const session = useSession();
  const navigate = useNavigate();

  const handleSignoutClick = useCallback(() => signOut().finally(() => navigate({ to: '/' })), [navigate]);
  return (
    <nav className='z-10 flex slide-in-down items-center justify-between gap-4 bg-primary p-4 text-light shadow-lg'>
      <Link to='/' className='me-auto'>
        <h1>Todos</h1>
      </Link>
      {location.pathname === '/' ? null : session.data?.user ? (
        <Button variant='ghost' onClick={handleSignoutClick}>{`Log out from ${session.data.user.name}`}</Button>
      ) : session.isPending ? (
        <LoaderCircle className='animate-spin' />
      ) : (
        <Button variant='ghost' as={Link} to='/'>
          Log in
        </Button>
      )}
    </nav>
  );
}
