import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { useRef } from 'react';
import { Card } from '@/components/card';
import { db } from '@/lib/drizzle';
import { todoTable } from '@/lib/drizzle/schema';

const getTodosFn = createServerFn({
  method: 'GET',
}).handler(async () => await db.select().from(todoTable));

const setTodoDoneFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; done: boolean }) => data)
  .handler(async ({ data: { id, done } }) => {
    await db.update(todoTable).set({ done }).where(eq(todoTable.id, id));
  });

const createTodoFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data: { name } }) => {
    await db.insert(todoTable).values({ name });
  });

const deleteTodoFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data: { id } }) => {
    await db.delete(todoTable).where(eq(todoTable.id, id));
  });

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getTodosFn(),
});

function Home() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className='flex flex-col gap-4 p-4'>
      <h1>Todos</h1>
      <Card title='Create new'>
        <div className='flex flex-wrap gap-4 items-center'>
          <label className='flex gap-2 items-center'>
            Name
            <input type='text' placeholder='Name' ref={nameInputRef} />
          </label>
          <button
            type='button'
            onClick={() => {
              if (!nameInputRef.current) return;
              createTodoFn({ data: { name: nameInputRef.current.value } }).then(() => {
                router.invalidate();
                if (nameInputRef.current) nameInputRef.current.value = '';
              });
            }}
          >
            Create
          </button>
        </div>
      </Card>
      {todos.map((todo) => (
        <Card key={todo.id} title={todo.name}>
          <div className='grid grid-cols-[auto_1fr] gap-2'>
            <div className='contents'>
              <span>Done</span>
              <span className={todo.done ? 'text-emerald-500' : 'text-rose-500'}>{String(todo.done)}</span>
            </div>
            <div className='contents'>
              <span>Created</span>
              <span>{todo.createdAt.toISOString()}</span>
            </div>
            <div className='contents'>
              <span>Updated</span>
              <span>{todo.updatedAt.toISOString()}</span>
            </div>
            <div className='col-span-2 flex justify-around'>
              <button
                type='button'
                onClick={() => {
                  setTodoDoneFn({ data: { id: todo.id, done: !todo.done } }).then(() => router.invalidate());
                }}
              >
                Toggle
              </button>
              <button
                type='button'
                onClick={() => {
                  deleteTodoFn({ data: { id: todo.id } }).then(() => router.invalidate());
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
