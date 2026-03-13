import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { type SubmitEvent, useCallback, useState } from 'react';
import z from 'zod';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { getSessionOrThrow } from '@/lib/auth';
import { authClient } from '@/lib/auth/client';

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.stringbool().optional().default(false),
});

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    // redirect has to be thrown
    try {
      await getSessionOrThrow();
    } catch {
      return;
    }
    throw redirect({ to: '/todos' });
  },
});

function Home() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const formData = Object.fromEntries(new FormData(event.target).entries());
      console.log('formData', formData);
      const parsed = schema.safeParse(formData);
      if (parsed.error) {
        console.error('validation failed', parsed.error);
        setError(parsed.error.message);
      } else
        authClient.signIn.email({ ...parsed.data }).then((response) => {
          if (response.error) {
            console.error('auth failed', response.error);
            setError(response.error.message ?? response.error.statusText);
          } else {
            console.log('auth successful');
            navigate({ to: '/todos' });
          }
        });
    },
    [navigate]
  );

  return (
    <Card title='Log in'>
      <form className='grid grid-cols-[auto_1fr] gap-4 items-center max-w-lg mx-auto' onSubmit={handleSubmit}>
        <label className='contents'>
          Email
          <input type='text' name='email' required />
        </label>
        <label className='contents'>
          Password
          <input type='password' name='password' required />
        </label>
        <label className='contents'>
          Remember me
          <input type='checkbox' name='rememberMe' className='me-auto' />
        </label>
        {error && <span className='col-span-full text-center text-danger'>{error}</span>}
        <Button className='col-start-2 me-auto' type='submit'>
          Log in
        </Button>
      </form>
    </Card>
  );
}
