import { createFileRoute } from '@tanstack/react-router';
import { and, eq, getTableColumns, inArray, max } from 'drizzle-orm';
import SuperJSON from 'superjson';
import { getSession } from '@/lib/better-auth/server';
import { db } from '@/lib/drizzle.server';
import { historyTable, todoTable } from '@/lib/drizzle.server/schema';
import { MessageClient } from '@/lib/messaging.server';
import type { Todo } from '@/lib/schemas';

// https://tanstack.com/start/latest/docs/framework/react/guide/server-routes

const REAUTHENTICATE_MS = 60_000;

interface AuthenticatedStream {
  controller: ReadableStreamDefaultController<unknown>;
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  headers: Headers;
  validatedAt: number;
}

export interface SseInvalidation {
  updated: Todo[];
  ids: number[];
}

const streams = new Set<AuthenticatedStream>();
const messageClient = new MessageClient(import.meta.url);

// TODO: may want to throttle this and cache invalidations for a while
const unsubscribe = messageClient.subscribe('invalidate', async ({ kind, ids, userId }) => {
  console.log('sse received invalidation', kind, ids, streams.size);
  if (!streams.size) return;

  // TODO: handle history once implemented in frontend
  if (kind !== 'todo') throw new Error(`sse: unhandled message kind ${kind}`);

  for (const stream of streams) {
    if (stream.session.user.id !== userId) continue;
    const now = Date.now();
    if (stream.validatedAt < now - REAUTHENTICATE_MS) {
      const session = await getSession({ headers: stream.headers });
      if (session?.session && session?.user) {
        stream.validatedAt = now;
        stream.session = session;
        console.log('reauthenticated', stream.session);
      } else {
        console.error('could not reauthenticate stream', stream.session);
        stream.controller.close();
        streams.delete(stream);
        continue;
      }
    }
    const updated = await db
      .select({ ...getTableColumns(todoTable), completedAt: max(historyTable.createdAt) })
      .from(todoTable)
      .leftJoin(historyTable, eq(historyTable.todoId, todoTable.id))
      .where(and(inArray(todoTable.id, ids), eq(todoTable.userId, userId)));
    const chunk = `event: invalidate\ndata: ${SuperJSON.stringify({ updated, ids } satisfies SseInvalidation)}\n\n`;
    console.log('sse send', chunk);
    stream.controller.enqueue(chunk);
  }
});

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      GET: async ({ request: { headers } }: { request: Request }) => {
        const validatedAt = Date.now();
        console.log('sse get', headers.get('cookie'));
        const session = await getSession({ headers });
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
                headers,
                validatedAt,
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
