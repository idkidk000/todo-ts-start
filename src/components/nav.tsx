import { Link } from '@tanstack/react-router';

export function Nav() {
  return (
    <nav className='sticky top-0 -mt-4 -mx-4 p-4 bg-background shadow-lg flex justify-between'>
      <Link to='/'>
        <h1>Todos</h1>
      </Link>
    </nav>
  );
}
