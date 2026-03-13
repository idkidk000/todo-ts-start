import { createFileRoute } from '@tanstack/react-router';
import { getSession } from '@/lib/better-auth/server';
import { MessageClient } from '@/lib/messaging.server';
import { omit } from '@/lib/utils';

// https://tanstack.com/start/latest/docs/framework/react/guide/server-routes

// TODO: periodically revalidate auth
interface AuthenticatedStream {
  controller: ReadableStreamDefaultController<unknown>;
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  headers: Headers;
  validatedAt: number;
}

const streams = new Set<AuthenticatedStream>();
const messageClient = new MessageClient(import.meta.url);

// TODO: switch client from loader data over to Tanstack Query. use an EventStream to connect to SSE and patch data in-place
// i think i saw something in the docs about configuring the router for spa mode too

// TODO: may want to throttle this and cache invalidations
messageClient.subscribe('invalidate', (message) => {
  console.log('received invalidation', message);
  if (!streams.size) return;

  // TODO: retrieve invalidated entries from the db and serialise with superjson
  // FIXME: need to filter invalidations by stream.session.user.id

  for (const stream of streams)
    stream.controller.enqueue(`event: invalidate\ndata: ${JSON.stringify(omit(message, ['topic']))}\n\n`);
});

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        console.log('sse get', request);
        const session = await getSession({ headers: request.headers });
        if (!session?.user)
          return new Response(JSON.stringify({ ok: false, error: 'auth failed' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
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
            },
            cancel: () => abortController.abort(),
          }),
          { headers: { 'Content-Type': 'text/event-stream' } }
        );
      },
    },
  },
});
