import { Link, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/button';
import { useAuth } from '@/hooks/auth';

export function Nav() {
  const { user, signOut } = useAuth();
  const location = useRouterState({ select: (s) => s.location });

  return (
    <nav className='sticky top-0 -mt-4 -mx-4 p-4 bg-background shadow-lg flex justify-between items-center gap-4'>
      <Link to='/' className='me-auto'>
        <h1>Todos</h1>
      </Link>
      {location.pathname === '/' ? null : user ? (
        <>
          <span className='text-muted text-sm'>{user.id}</span>
          <Button variant='ghost' onClick={signOut}>{`Log out from ${user.name}`}</Button>
        </>
      ) : (
        <Button variant='ghost' as={Link} to='/'>
          Log in
        </Button>
      )}
    </nav>
  );
}
