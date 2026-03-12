import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useCallback, useId, useRef } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { getSession } from '@/lib/auth';
import { authClient } from '@/lib/auth/client';

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: '/todos' });
    }
  },
});

// TODO: this coulld definitely be an actual form
function Home() {
  const navigate = useNavigate();
  const usernameId = useId();
  const passwordId = useId();
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLSpanElement | null>(null);

  // TODO: just use a form
  const handleSubmitButton = useCallback(() => {
    console.log('submit button');
    authClient.signIn
      .email({
        email: usernameRef.current?.value ?? '',
        password: passwordRef.current?.value ?? '',
        rememberMe: true,
      })
      .then((response) => {
        if (response.error) {
          console.error('auth failed', response.error);
          if (errorRef.current) errorRef.current.innerText = JSON.stringify(response.error);
        } else {
          console.log('auth successful');
          navigate({ to: '/todos' });
        }
      });
  }, [navigate]);

  return (
    <Card title='Log in'>
      <div className='grid grid-cols-[auto_1fr] gap-4 items-center max-w-lg mx-auto'>
        <div className='contents'>
          <label htmlFor={usernameId}>Username or email</label>
          <input type='text' id={usernameId} ref={usernameRef} name='email' />
        </div>
        <div className='contents'>
          <label htmlFor={passwordId}>Password</label>
          <input type='password' id={passwordId} ref={passwordRef} name='password' />
        </div>
        <div className='col-span-full flex justify-center'>
          <Button onClick={handleSubmitButton}>Login</Button>
        </div>
        <span className='col-span-full text-center text-danger' ref={errorRef} />
      </div>
    </Card>
  );
}
