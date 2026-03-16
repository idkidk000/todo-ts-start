import { eq } from 'drizzle-orm';
import { db } from '@/lib/drizzle.server';
import { todoTable } from '@/lib/drizzle.server/schema';
import { MessageClient } from '@/lib/messaging.server';

const messageClient = new MessageClient(import.meta.url);

// TODO: handle `snooze` and `repeat`
export async function updateTodosJob() {
  const updated = await db.update(todoTable).set({ done: false }).where(eq(todoTable.done, true)).returning();
  console.log('updateTodosJob', updated);
  const userIds = new Map<string, number[]>();
  for (const item of updated) if (!userIds?.get(item.userId)?.push(item.id)) userIds.set(item.userId, [item.id]);
  if (userIds.size)
    messageClient.send(
      ...userIds
        .entries()
        .map(([userId, ids]) => ({ topic: 'invalidate' as const, kind: 'todo' as const, ids, userId }))
    );
}
