import { MessageServer } from '@/lib/messaging.server';

let server: MessageServer | null = null;

export function start(): void {
  if (server === null) server = new MessageServer();
}

export function stop(): void {
  server?.stop();
}
