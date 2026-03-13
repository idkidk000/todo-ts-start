/** biome-ignore-all lint/a11y/noLabelWithoutControl: biome bug */
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { Modal, ModalContent, useModal } from '@/components/modal';
import { TodoCard } from '@/components/todo-card';
import type { TodoWithCompletedAt } from '@/lib/schemas';
import { todoInsert, todoWithCompletedAtSelect } from '@/lib/todos';

export const Route = createFileRoute('/_authed/todos/{-$todoId}')({
  component: Dashboard,
  loader: async () => await todoWithCompletedAtSelect(),
});

// TODO: Todo form component. use it for add/edit. add the new fields
function Dashboard() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const doneCheckboxRef = useRef<HTMLInputElement | null>(null);
  const { todoId } = Route.useParams();

  const modalTodo = useMemo(() => {
    if (!todoId) return;
    const todoIdInt = parseInt(todoId, 10);
    return todos.find((item) => item.id === todoIdInt);
  }, [todos, todoId]);

  return (
    <>
      <Card title='Create new'>
        <div className='flex flex-wrap gap-4 items-center'>
          <label className='flex gap-2 items-center'>
            Name
            <Input type='text' placeholder='Name' ref={nameInputRef} />
          </label>
          <label className='flex gap-2 items-center'>
            Done
            <Input type='checkbox' placeholder='Name' ref={doneCheckboxRef} />
          </label>
          <Button
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
          </Button>
        </div>
      </Card>
      {todos.map((todo) => (
        <TodoCard key={todo.id} {...todo} />
      ))}
      <Modal>
        <TodoModal todo={modalTodo} />
      </Modal>
    </>
  );
}

function TodoModal({ todo }: { todo: TodoWithCompletedAt | undefined }) {
  const { open } = useModal();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    console.log('modal close');
    navigate({ to: '/todos/{-$todoId}', params: { todoId: undefined } });
  }, [navigate]);

  useEffect(() => {
    if (todo) open();
  }, [todo]);

  return <ModalContent onClose={handleClose}>{todo ? <TodoCard {...todo} /> : null}</ModalContent>;
}
