/** biome-ignore-all lint/a11y/noLabelWithoutControl: biome bug */
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { type SubmitEvent, useCallback, useState } from 'react';
import z from 'zod';

import { Card } from '@/components/card';
import { getSessionOrThrow } from '@/lib/better-auth';
import { signIn } from '@/lib/better-auth/client';
import { makeZodValidator, useAppForm } from '@/lib/form';

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    // redirect has to be thrown
    try {
      await getSessionOrThrow();
    } catch {
      return;
    }
    throw redirect({ to: '/todos/{-$todoId}', params: { todoId: undefined } });
  },
});

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.union([z.stringbool(), z.boolean()]).default(false).describe('Remember this device?'),
});

const validator = makeZodValidator(schema);

function Home() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useAppForm({
    validators: {
      onBlur: validator,
      onSubmit: validator,
    },
    defaultValues: {
      password: '',
      rememberMe: false,
      username: '',
    } satisfies z.infer<typeof schema>,
    onSubmit({ value }) {
      signIn.username(value).then((response) => {
        if (response.error) {
          console.error('auth failed', response.error);
          setError(response.error.message ?? response.error.statusText);
        } else {
          console.log('auth successful');
          navigate({ to: '/todos/{-$todoId}', params: { todoId: undefined } });
        }
      });
    },
  });

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <Card title='Log in' className='mx-auto w-dvw max-w-lg md:my-auto lg:w-lg'>
      <form className='mx-auto grid grid-cols-[auto_1fr] items-center gap-4' onSubmit={handleSubmit}>
        <form.AppField name='username'>{(field) => <field.FormInput type='text' />}</form.AppField>
        <form.AppField name='password'>{(field) => <field.FormInput type='password' />}</form.AppField>
        <form.AppField name='rememberMe'>{(field) => <field.FormInput type='checkbox' />}</form.AppField>
        {error && <span className='col-span-full text-center text-danger'>{error}</span>}
        <form.Button className='col-span-full mx-auto' type='submit'>
          Log in
        </form.Button>
      </form>
    </Card>
  );
}
