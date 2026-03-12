import { eq } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { todoTable } from '@/lib/drizzle/schema';
import { MessageClient } from '@/lib/messaging.server';

const messageClient = new MessageClient(import.meta.url);

// TODO: handle `snooze` and `repeat`
// TODO: need SSE to push updates to the client
export async function updateTodosJob() {
  const updated = await db.update(todoTable).set({ done: false }).where(eq(todoTable.done, true)).returning();
  console.log('update-todos worker work', updated);
  if (updated.length) messageClient.send({ topic: 'invalidate', kind: 'todo', ids: updated.map(({ id }) => id) });
}
