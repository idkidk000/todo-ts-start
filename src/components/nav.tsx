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
    <nav className='sticky top-0 -mt-4 -mx-4 p-4 bg-background shadow-lg flex justify-between items-center gap-4 slide-in-down z-10'>
      <Link to='/' className='me-auto'>
        <h1>Todos</h1>
      </Link>
      {location.pathname === '/' ? null : session.data?.user ? (
        <>
          <span className='text-muted text-sm'>{session.data.user.id}</span>
          <Button variant='ghost' onClick={handleSignoutClick}>{`Log out from ${session.data.user.name}`}</Button>
        </>
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
