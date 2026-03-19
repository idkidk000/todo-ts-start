/// <reference types="vite/client" />

import { exit } from 'node:process';

import handler from '@tanstack/react-start/server-entry';

import * as messageBusWorker from '@/workers/message-bus';
import * as schedulerWorker from '@/workers/scheduler';

// https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point
// https://vite.dev/guide/api-hmr.html#hmr-api

interface Worker {
  start: () => void | Promise<void>;
  stop: () => void | Promise<void>;
}

const workers: Worker[] = [messageBusWorker, schedulerWorker];

function startWorkers() {
  console.log('starting workers');
  for (const worker of workers) worker.start();
  console.log('started workers');
}

function stopWorkers() {
  console.log('stopping workers');
  for (const worker of workers) worker.stop();
  console.log('stopped workers');
}

function stopWorkersAndShutdown() {
  stopWorkers();
  exit(0);
}

startWorkers();
process.addListener('SIGINT', stopWorkersAndShutdown);
process.addListener('SIGTERM', stopWorkersAndShutdown);

// cleanup old instance during hmr in dev
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    console.log('server hmr stop workers');
    process.removeListener('SIGINT', stopWorkersAndShutdown);
    process.removeListener('SIGTERM', stopWorkersAndShutdown);
    stopWorkers();
  });
} else console.log('no import.meta.hot');

// export the default server unchanged
export default handler;
