import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { getSessionOrThrow } from '@/lib/auth';

type Context = Awaited<ReturnType<typeof getSessionOrThrow>> | null;
const Context = createContext<Context>(null);

// BUG: this requires a page reload to update since we don't have any auth events to respond to
// probably should expose sign in/out here and not use lib/auth directly anywhere else
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Context | null>(null);
  useEffect(() => {
    getSessionOrThrow()
      .then((session) => setAuth(session))
      .catch((error) => console.error('error in auth context', error));
  }, []);

  return <Context value={auth}>{children}</Context>;
}

export function useAuth(): Context {
  const context = useContext(Context);
  return context;
}
