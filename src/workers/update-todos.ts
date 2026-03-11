import { eq } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { todoTable } from '@/lib/drizzle/schema';

const INTERVAL_MS = 60_000;

let interval: NodeJS.Timeout | null = null;

async function worker() {
  const { rowsAffected } = await db.update(todoTable).set({ done: false }).where(eq(todoTable.done, true));
  console.log('update-todos worker work', { rowsAffected });
  // TODO: will need a mechanism to invalidate client data
  // probably will be a MessageBus on the server, SSE (or maybe a websocket since this is just a plain Node server) to push updates to the client, and Tanstack Query to handle clientside data composition
}

// called from src/server.ts
export function start() {
  console.log('update-todos worker start');
  if (interval === null) interval = setInterval(worker, INTERVAL_MS);
}

// called from src/server.ts
export function stop() {
  console.log('update-todos worker stop');
  if (interval !== null) clearInterval(interval);
}
