/** biome-ignore-all lint/a11y/noLabelWithoutControl: biome bug */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/input';
import { Modal, ModalContent, ModalTrigger, useModal } from '@/components/modal';
import { Select } from '@/components/select';
import { TodoCard } from '@/components/todo-card';
import { TodoForm } from '@/forms/todo';
import { useData } from '@/hooks/data';
import { lowerToSentenceCase } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/todos/{-$todoId}')({
  component: Dashboard,
});

const states = ['all', 'done', 'due', 'snoozed'] as const;
type State = (typeof states)[number];

function Dashboard() {
  const { todos } = useData();
  const [filter, setFilter] = useState<{ state: State; search: string | null }>({ state: 'all', search: null });

  const handleStateFilterChange = useCallback((state: State) => setFilter((prev) => ({ ...prev, state })), []);
  const handleSearchFilterChange = useCallback(
    (search: string) => setFilter((prev) => ({ ...prev, search: search || null })),
    []
  );

  return (
    <Modal>
      <div
        className='flex gap-4 flex-wrap items-center sticky top-0 bg-background shadow-lg z-5 -mx-4 px-4 py-2 snap-start'
        role='menubar'
      >
        <h3 className='text-lg font-semibold'>Filters</h3>
        <Select
          type='string'
          options={states.map((value) => ({ value, label: lowerToSentenceCase(value) }))}
          value={filter.state}
          onValueChange={handleStateFilterChange}
          multiple={false}
        />
        <Input
          type='search'
          value={filter.search ?? ''}
          onValueChange={handleSearchFilterChange}
          placeholder='Search'
        />
        <ModalTrigger>Create new</ModalTrigger>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
        {todos
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .filter(
            (item) =>
              (filter.search === null || item.name.toLocaleLowerCase().includes(filter.search.toLocaleLowerCase())) &&
              (filter.state === 'all' ||
                (filter.state === 'done' && item.done) ||
                (filter.state === 'snoozed' && item.snoozed) ||
                (filter.state === 'due' && !item.done && !item.snoozed))
          )
          .map((todo) => (
            <TodoCard key={todo.id} {...todo} />
          ))}
      </div>

      <TodoModal />
    </Modal>
  );
}

function TodoModal() {
  const { close, open } = useModal();
  const navigate = useNavigate();
  const { todoId: todoIdStr } = Route.useParams();
  const todoId = todoIdStr ? Number(todoIdStr) : undefined;

  const handleClose = useCallback(() => {
    console.log('modal close');
    navigate({ to: '/todos/{-$todoId}', params: { todoId: undefined } });
  }, [navigate]);

  useEffect(() => {
    if (todoId) open();
  }, [todoId]);

  return (
    <ModalContent onClose={handleClose}>
      <div className='flex flex-col gap-4'>
        <h2>{todoId ? 'Edit Todo' : 'Create Todo'}</h2>
        <TodoForm todoId={todoId} onCompleted={close} />
      </div>
    </ModalContent>
  );
}
