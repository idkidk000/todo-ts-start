import { Link, useRouter } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { toLocalIso } from '@/lib/date';
import { repeatToString, type Todo } from '@/lib/schemas';
import { todoUpdate } from '@/lib/todos';

export function TodoCard({ completedAt, createdAt, done, id, name, repeat, snoozed, updatedAt }: Todo) {
  const router = useRouter();

  const handleDoneClick = useCallback(
    () => todoUpdate({ data: { id: id, done: !done } }).then(() => router.invalidate()),
    [id, done, router]
  );

  const handleSnoozedClick = useCallback(
    () => todoUpdate({ data: { id: id, snoozed: !snoozed } }).then(() => router.invalidate()),
    [id, snoozed, router]
  );

  // FIXME: `Button`s generics are breaking `Link`s
  const linkParams = useMemo(() => ({ todoId: String(id) }) as unknown as true, [id]);

  return (
    <Card title={name || 'Untitled'}>
      <div className='mx-auto grid grid-cols-[auto_1fr] gap-2'>
        <div className='contents'>
          <span>State</span>
          <Badge variant={done ? 'success' : snoozed ? 'warning' : 'danger'} className='me-auto mb-auto' size='sm'>
            {done ? 'Done' : snoozed ? 'Snoozed' : 'Due'}
          </Badge>
        </div>
        <div className='contents'>
          <span>Repeat</span>
          <span>{repeatToString(repeat)}</span>
        </div>
        <div className='contents'>
          <span>Created</span>
          <span>{toLocalIso(createdAt, { endAt: 'm' })}</span>
        </div>
        <div className='contents'>
          <span>Updated</span>
          <span>{toLocalIso(updatedAt, { endAt: 'm' })}</span>
        </div>
        <div className='contents'>
          <span>Completed</span>
          <span>{completedAt ? toLocalIso(completedAt, { endAt: 'm' }) : 'Never'}</span>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <Button size='sm' variant='primary' className='col-span-full' onClick={handleDoneClick}>
          Toggle Done
        </Button>
        <Button size='sm' variant='muted' onClick={handleSnoozedClick}>
          Toggle Snoozed
        </Button>
        <Button size='sm' variant='muted' as={Link} to='/todos/$todoId' params={linkParams}>
          Edit
        </Button>
      </div>
    </Card>
  );
}
