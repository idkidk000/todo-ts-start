import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback } from 'react';
import { Button } from '@/components/button';
import { useAuth } from '@/hooks/auth';
import { authClient } from '@/lib/auth/client';

export function Nav() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });

  const handleLogOutClick = useCallback(() => {
    // TODO: it properly
    // - move sign in/out to the context provider
    // - have the redirect/nagivate logic there. or re-eval _authed.tsx somehow
    authClient.signOut().finally(() => navigate({ to: '/' }));
  }, [navigate]);

  return (
    <nav className='sticky top-0 -mt-4 -mx-4 p-4 bg-background shadow-lg flex justify-between items-center gap-4'>
      <Link to='/' className='me-auto'>
        <h1>Todos</h1>
      </Link>
      {location.pathname === '/' ? null : auth?.user ? (
        <>
          <span className='text-muted text-sm'>{auth.user.id}</span>
          <Button variant='ghost' onClick={handleLogOutClick}>{`Log out from ${auth.user.name}`}</Button>
        </>
      ) : (
        <Button variant='ghost' as={Link} to='/'>
          Log in
        </Button>
      )}
    </nav>
  );
}
