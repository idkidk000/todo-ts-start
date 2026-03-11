import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useRef } from 'react';
import { Card } from '@/components/card';
import { todoDeleteFn, todoInsertFn, todosGetFn, todoUpdateFn } from '@/server-functions/todo';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await todosGetFn(),
});

function Home() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const doneCheckboxRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className='flex flex-col gap-4 p-4'>
      <h1 className='sticky top-0 -mt-4 -mx-4 p-4 bg-background shadow-lg'>Todos</h1>
      <Card title='Create new'>
        <div className='flex flex-wrap gap-4 items-center'>
          <label className='flex gap-2 items-center'>
            Name
            <input type='text' placeholder='Name' ref={nameInputRef} />
          </label>
          <label className='flex gap-2 items-center'>
            Done
            <input type='checkbox' placeholder='Name' ref={doneCheckboxRef} />
          </label>
          <button
            type='button'
            onClick={() => {
              if (!nameInputRef.current || !doneCheckboxRef.current) return;
              todoInsertFn({
                data: {
                  name: nameInputRef.current.value,
                  done: doneCheckboxRef.current.checked,
                },
              }).then(() => {
                router.invalidate();
                if (nameInputRef.current) nameInputRef.current.value = '';
                if (doneCheckboxRef.current) doneCheckboxRef.current.checked = false;
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
                  todoUpdateFn({ data: { id: todo.id, done: !todo.done } }).then(() => router.invalidate());
                }}
              >
                Toggle
              </button>
              <button
                type='button'
                onClick={() => {
                  todoDeleteFn({ data: { id: todo.id } }).then(() => router.invalidate());
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
