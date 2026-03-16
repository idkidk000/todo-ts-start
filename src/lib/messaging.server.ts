import { rmSync } from 'node:fs';
import { createServer, Socket } from 'node:net';
import { createInterface } from 'node:readline';
import { SuperJSON } from 'superjson';

const SOCKET_PATH = '.message-bus.sock';
const CONNECT_RETRY_MS = 100;
const MAX_CONNECT_RETRIES = 10;

// TODO: make this generic and break it out into a separate project which can be included as a package or submodule

type Message =
  | {
      topic: 'invalidate';
      kind: 'todo' | 'history';
      ids: number[];
      userId: string;
    }
  | {
      topic: 'method';
      kind: 'schedule';
      ids: number[];
      userId: string;
    };

type MessageTopic = Message['topic'];

type ClientToServerMessage =
  | {
      kind: 'subscribe';
      topic: MessageTopic;
      immediate: boolean;
    }
  | {
      kind: 'unsubscribe';
      topic: MessageTopic;
    }
  | {
      kind: 'message';
      message: Message;
    };

type Callback<Topic extends MessageTopic> = (message: Extract<Message, { topic: Topic }>) => void | Promise<void>;

type Unsubscribe = () => void;

export class MessageServer {
  #topicClients = new Map<MessageTopic, Set<Socket>>();
  #states = new Map<MessageTopic, Message>();

  #server = createServer((client) => {
    client.addListener('error', console.error);
    const readline = createInterface(client);
    readline.addListener('error', console.error);
    readline.addListener('close', () => {
      for (const clients of this.#topicClients.values()) clients.delete(client);
    });
    readline.addListener('line', (data) => {
      const parsed: ClientToServerMessage = SuperJSON.parse(data);

      switch (parsed.kind) {
        case 'message': {
          this.#states.set(parsed.message.topic, parsed.message);
          for (const other of this.#topicClients.get(parsed.message.topic) ?? [])
            other.write(`${SuperJSON.stringify(parsed.message)}\n`);
          break;
        }

        case 'subscribe': {
          if (!this.#topicClients.get(parsed.topic)?.add(client))
            this.#topicClients.set(parsed.topic, new Set([client]));
          if (parsed.immediate && this.#states.has(parsed.topic))
            client.write(`${SuperJSON.stringify(this.#states.get(parsed.topic))}\n`);
          break;
        }

        case 'unsubscribe': {
          this.#topicClients.get(parsed.topic)?.delete(client);
          break;
        }

        default:
          console.warn('server - unhandled message kind', parsed);
      }
    });
  });

  #cleanup(): void {
    try {
      rmSync(SOCKET_PATH, { force: true });
    } catch {
      /* empty */
    }
  }

  constructor() {
    this.#cleanup();
    this.#server.addListener('error', console.error);
    this.#server.listen(SOCKET_PATH);
    console.log('listening on', SOCKET_PATH);
  }

  stop(): void {
    for (const clients of this.#topicClients.values()) for (const client of clients) client.destroy();
    this.#server.close(() => {
      console.log('message server stopped');
    });
  }
}

export class MessageClient {
  #socket: Socket | null = null;
  #queue: ClientToServerMessage[] = [];
  #topicCallbacks = new Map<MessageTopic, Set<Callback<MessageTopic>>>();

  #sendInternal(...messages: ClientToServerMessage[]): void {
    if (!this.#socket) {
      console.log('queuing', ...messages);
      if (messages.length) this.#queue.push(...messages);
      return;
    } else {
      const allMessages: ClientToServerMessage[] = [...this.#queue.splice(0, this.#queue.length), ...messages];
      if (!allMessages.length) return;
      console.log('sending', allMessages);
      this.#socket.write(allMessages.map((message) => `${SuperJSON.stringify(message)}\n`).join(''));
    }
  }

  constructor(public readonly importMetaUrl: string) {
    let socket: Socket;
    let retries = 0;
    const interval = setInterval(() => {
      ++retries;
      if (socket) socket.destroy();
      socket = new Socket();

      socket.addListener('error', (err) => {
        if (retries === MAX_CONNECT_RETRIES) {
          clearInterval(interval);
          throw new Error(`could not connect to ${SOCKET_PATH} after ${retries} attempts`, { cause: err });
        }
      });

      socket.addListener('ready', () => {
        clearInterval(interval);
        this.#socket = socket;
        console.info(importMetaUrl, 'connected to', SOCKET_PATH);
        const readline = createInterface(socket);
        readline.addListener('error', console.error);
        readline.addListener('line', (data) => {
          const parsed: Message = SuperJSON.parse(data);
          console.log('received', parsed);
          for (const callback of this.#topicCallbacks?.get(parsed.topic) ?? []) callback(parsed);
        });
        this.#sendInternal();
      });

      socket.connect(SOCKET_PATH);
    }, CONNECT_RETRY_MS);
  }

  subscribe<Topic extends MessageTopic>(topic: Topic, callback: Callback<Topic>, immediate = false): Unsubscribe {
    const genericCallback = callback as unknown as Callback<MessageTopic>;

    if (!this.#topicCallbacks.get(topic)?.add(genericCallback))
      this.#topicCallbacks.set(topic, new Set([genericCallback]));

    this.#sendInternal({ kind: 'subscribe', topic, immediate });

    return () => {
      this.#topicCallbacks.get(topic)?.delete(genericCallback);
      if ((this.#topicCallbacks.get(topic)?.size ?? 0) === 0) {
        this.#topicCallbacks.delete(topic);
        this.#sendInternal({ kind: 'unsubscribe', topic });
      }
    };
  }

  send(...messages: Message[]): void {
    this.#sendInternal(...messages.map((message) => ({ kind: 'message' as const, message })));
  }
}
