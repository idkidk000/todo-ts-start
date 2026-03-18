/** biome-ignore-all lint/a11y/noLabelWithoutControl: biome bug */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/card';
import { Modal, ModalContent, useModal } from '@/components/modal';
import { TodoCard } from '@/components/todo-card';
import { TodoForm } from '@/forms/todo';
import { useData } from '@/hooks/data';
import type { Todo } from '@/lib/schemas';

export const Route = createFileRoute('/_authenticated/todos/{-$todoId}')({
  component: Dashboard,
});

// TODO: Todo form component. use it for add/edit. add the new fields
function Dashboard() {
  const { todos } = useData();
  const { todoId } = Route.useParams();

  const modalTodo = useMemo(() => {
    if (!todoId) return;
    const todoIdInt = parseInt(todoId, 10);
    return todos.find((item) => item.id === todoIdInt);
  }, [todos, todoId]);

  return (
    <>
      <Card title='Create new'>
        <TodoForm />
      </Card>
      {todos
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((todo) => (
          <TodoCard key={todo.id} {...todo} />
        ))}
      <Modal>
        <TodoModal todo={modalTodo} />
      </Modal>
    </>
  );
}

function TodoModal({ todo }: { todo: Todo | undefined }) {
  const { close, open } = useModal();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    console.log('modal close');
    navigate({ to: '/todos/{-$todoId}', params: { todoId: undefined } });
  }, [navigate]);

  useEffect(() => {
    if (todo) open();
  }, [todo]);

  return (
    <ModalContent onClose={handleClose}>
      <div className='flex flex-col gap-4'>
        <h2>{`Edit ${todo?.name ?? 'Todo'}`}</h2>
        <TodoForm todoId={todo?.id} onSubmitted={close} />
      </div>
    </ModalContent>
  );
}
