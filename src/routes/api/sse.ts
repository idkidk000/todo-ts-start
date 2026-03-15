import { createFileRoute } from '@tanstack/react-router';
import { eq, getTableColumns, inArray, max } from 'drizzle-orm';
import SuperJSON from 'superjson';
import { getSession } from '@/lib/better-auth/server';
import { db } from '@/lib/drizzle.server';
import { historyTable, todoTable } from '@/lib/drizzle.server/schema';
import { MessageClient } from '@/lib/messaging.server';
import type { TodoWithCompletedAt } from '@/lib/schemas';

// https://tanstack.com/start/latest/docs/framework/react/guide/server-routes

const REAUTHENTICATE_MS = 60_000;

// TODO: periodically revalidate auth
interface AuthenticatedStream {
  controller: ReadableStreamDefaultController<unknown>;
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  headers: Headers;
  validatedAt: number;
}

export interface SseInvalidation {
  updated: TodoWithCompletedAt[];
  ids: number[];
}

const streams = new Set<AuthenticatedStream>();
const messageClient = new MessageClient(import.meta.url);

// TODO: may want to throttle this and cache invalidations for a while
const unsubscribe = messageClient.subscribe('invalidate', async ({ kind, ids }) => {
  console.log('sse received invalidation', kind, ids, streams.size);
  if (!streams.size) return;

  // TODO: handle history once implemented in frontend
  if (kind !== 'todo') throw new Error(`sse: unhandled message kind ${kind}`);

  // FIXME: i don't seem to be able to call server functions from here (even with passwed headers) so i may need raw (plain functions) and wrapped (createServerFn) versions
  const updatedTodos = await db
    .select({
      ...getTableColumns(todoTable),
      completedAt: max(historyTable.createdAt),
    })
    .from(todoTable)
    .leftJoin(historyTable, eq(historyTable.todoId, todoTable.id))
    .where(inArray(todoTable.id, ids))
    .groupBy(todoTable.id);
  // sets would be more correct but slower for such small item counts
  const deletedIds = ids.filter((id) => !updatedTodos.find((updated) => updated.id === id));

  // FIXME: need to come up with something better for deletions. we no longer have the record so we can't determine who it belonged to. sending all deleted ids to all clients seems kind of leaky
  for (const stream of streams) {
    const now = Date.now();
    if (stream.validatedAt < now - REAUTHENTICATE_MS) {
      const session = await getSession({ headers: stream.headers });
      if (!session?.session || !session.user) {
        console.error('could not reauthenticate stream', stream.session);
        stream.controller.close();
        continue;
      }
      stream.validatedAt = now;
      stream.session = session;
    }
    const updated = updatedTodos.filter((item) => item.userId === stream.session.user.id);
    if (!updated.length && !deletedIds.length) continue;
    const string = `event: invalidate\ndata: ${SuperJSON.stringify({ updated, ids: [...deletedIds, ...updated.map(({ id }) => id)] } satisfies SseInvalidation)}\n\n`;
    console.log('sse send', string);
    stream.controller.enqueue(string);
  }
});

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        console.log('sse get', request);
        const session = await getSession({ headers: request.headers });
        if (!session?.user) {
          console.error('sse unauthenticated');
          return new Response(JSON.stringify({ ok: false, error: 'auth failed' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const abortController = new AbortController();
        return new Response(
          new ReadableStream({
            start: (streamController) => {
              const stream: AuthenticatedStream = {
                controller: streamController,
                session,
                headers: request.headers,
                validatedAt: Date.now(),
              };
              streams.add(stream);
              abortController.signal.addEventListener('abort', () => streams.delete(stream));
              // first message fires the `open` event on the client
              streamController.enqueue(`event: connected\n\n`);
              console.info('sse begin');
            },
            cancel: () => abortController.abort(),
          }),
          { headers: { 'Content-Type': 'text/event-stream' } }
        );
      },
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    console.log('sse hmr close streams');
    for (const stream of streams) stream.controller.close();
    unsubscribe();
  });
}
