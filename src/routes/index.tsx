import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useRef } from 'react';
import { Card } from '@/components/card';
import { TodoCard } from '@/components/todo-card';
import { todoInsert, todoWithCompletedAtSelect } from '@/server-functions';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await todoWithCompletedAtSelect(),
});

// TODO: Todo form component. use it for add/edit. add the new fields
function Home() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const doneCheckboxRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
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
              todoInsert({
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
        <TodoCard key={todo.id} {...todo} />
      ))}
    </>
  );
}
