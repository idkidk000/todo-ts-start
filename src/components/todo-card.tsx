import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import type { TodoWithCompletedAt } from '@/lib/schemas';
import { todoDelete, todoUpdate } from '@/lib/todos';

export function TodoCard({ completedAt, createdAt, done, id, name, repeat, snoozed, updatedAt }: TodoWithCompletedAt) {
  const router = useRouter();
  const navigate = useNavigate();

  const handleDoneClick = useCallback(
    () => todoUpdate({ data: { id: id, done: !done } }).then(() => router.invalidate()),
    [id, done, router.invalidate]
  );

  const handleSnoozedClick = useCallback(
    () => todoUpdate({ data: { id: id, snoozed: !snoozed } }).then(() => router.invalidate()),
    [id, snoozed, router.invalidate]
  );

  const handleDeleteClick = useCallback(() => {
    todoDelete({ data: { id: id } }).then(() => navigate({ to: '/todos/{-$todoId}', params: { todoId: undefined } }));
  }, [id, navigate]);

  // FIXME: `Button`s generics are breaking `Link`s
  const linkParams = useMemo(() => ({ todoId: String(id) }) as unknown as true, [id]);

  return (
    <Card title={name}>
      <div className='grid grid-cols-[auto_1fr] gap-2'>
        <div className='contents'>
          <span>State</span>
          <Badge variant={done ? 'success' : snoozed ? 'warning' : 'danger'} className='me-auto' size='sm'>
            {done ? 'Done' : snoozed ? 'Snoozed' : 'Due'}
          </Badge>
        </div>
        <div className='contents'>
          <span>Done</span>
          <span>{String(done)}</span>
        </div>
        <div className='contents'>
          <span>Snoozed</span>
          <span>{String(snoozed)}</span>
        </div>
        <div className='contents'>
          <span>Repeat</span>
          <span>{JSON.stringify(repeat)}</span>
        </div>
        <div className='contents'>
          <span>Created</span>
          <span>{createdAt.toISOString()}</span>
        </div>
        <div className='contents'>
          <span>Updated</span>
          <span>{updatedAt.toISOString()}</span>
        </div>
        <div className='contents'>
          <span>Completed</span>
          <span>{completedAt?.toISOString() ?? 'never'}</span>
        </div>
        <div className='col-span-2 flex justify-around gap-2'>
          <Button onClick={handleDoneClick}>Toggle Done</Button>
          <Button onClick={handleSnoozedClick}>Toggle Snoozed</Button>
          <Button variant='danger' onClick={handleDeleteClick}>
            Delete
          </Button>
          <Button as={Link} to='/todos/$todoId' params={linkParams}>
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
}
