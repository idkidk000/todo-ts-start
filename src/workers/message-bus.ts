import { rmSync } from 'node:fs';
import { createServer, type Socket } from 'node:net';
import { createInterface } from 'node:readline';

let server: MessageBusServer | null = null;

const SOCKET_PATH = '.message-bus.sock';

/* TODO: make this much more robust
 * (de)serialise messages with SuperJSON
 * add topics
 * add (un)subscribe messages
 * full type safety - each topic has an expected message type
 * add a client
 * consider hmr
 * - stop() returns before the server has necessarily closed, which may be a problem
 * - handle server start retry
 * - handle client connect retry
 */
class MessageBusServer {
  #clients = new Set<Socket>();
  #server = createServer((client) => {
    client.addListener('error', console.error);
    this.#clients.add(client);
    const readline = createInterface(client);
    readline.addListener('error', console.error);
    readline.addListener('line', (data) => {
      for (const otherClient of this.#clients) if (otherClient !== client) otherClient.write(`${data}\n`);
    });
    readline.addListener('close', () => this.#clients.delete(client));
  });
  constructor() {
    this.#server.addListener('error', console.error);
    try {
      rmSync(SOCKET_PATH, { force: true });
    } catch {
      /* empty */
    }
    this.#server.listen(SOCKET_PATH);
    console.log('listening on', SOCKET_PATH);
  }
  stop(): void {
    this.#server.close();
  }
}

export function start(): void {
  if (server === null) server = new MessageBusServer();
}

export function stop(): void {
  server?.stop();
}
