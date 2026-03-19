import { gracefulShutdown, scheduleJob } from 'node-schedule';

import { updateTodosJob } from '@/workers/jobs';

export function start(): void {
  scheduleJob({ minute: 0 }, updateTodosJob);
  console.log('scheduler started');
}

export function stop(): void {
  gracefulShutdown();
  console.log('scheduler stopped');
}
