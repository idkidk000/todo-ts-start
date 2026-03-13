import { useNavigate } from '@tanstack/react-router';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSessionOrThrow } from '@/lib/auth';
import { authClient } from '@/lib/auth/client';

type Context = {
  user: Awaited<ReturnType<typeof getSessionOrThrow>>['user'] | null;
  session: Awaited<ReturnType<typeof getSessionOrThrow>>['session'] | null;
  signIn: (param: { email: string; password: string; rememberMe: boolean }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};
const Context = createContext<Context | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Pick<Context, 'user' | 'session'>>({ session: null, user: null });
  const navigate = useNavigate();

  const updateAuth = useCallback(
    () =>
      getSessionOrThrow()
        .then((session) => {
          setAuth(session);
          return true;
        })
        .catch((error) => {
          console.error('error in auth context', String(error));
          setAuth({ session: null, user: null });
          return false;
        }),
    []
  );

  useEffect(() => {
    updateAuth();
  }, [updateAuth]);

  const value: Context = useMemo(
    () => ({
      ...auth,
      async signIn(param) {
        // TODO: return type doesn't include session. but maybe i don't need it anyway?
        const result = await authClient.signIn.email(param);
        if (result.data?.user && (await updateAuth())) return {};
        return { error: result.error?.message ?? result.error?.statusText ?? 'Unknown error' };
      },
      async signOut() {
        await authClient.signOut();
        setAuth({ session: null, user: null });
        navigate({ to: '/' });
      },
    }),
    [auth, updateAuth, navigate]
  );

  return <Context value={value}>{children}</Context>;
}

export function useAuth(): Context {
  const context = useContext(Context);
  if (!context) throw new Error('useAuth must be used underneath an AuthProvider');
  return context;
}
