import { sql } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { Repeat } from '@/lib/schemas';

export const todoTable = sqliteTable('todo', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  done: int({ mode: 'boolean' }).notNull().default(false),
  snoozed: int({ mode: 'boolean' }).notNull().default(false),
  repeat: text({ mode: 'json' })
    .notNull()
    .default({ mode: 'never' } satisfies Repeat)
    .$type<Repeat>(),
  // subsec modifier returns a float. drizzle doesn't allow floats (real) to be used as a timestamp. but it does correctly handle float timestamps from columns it thinks are ints. sqlite really doesn't care about types so i guess it's all fine maybe???
  createdAt: int({ mode: 'timestamp' }).notNull().default(sql`(unixepoch('subsec'))`),
  updatedAt: int({ mode: 'timestamp' })
    .notNull()
    .$onUpdate(() => sql`(unixepoch('subsec'))`),
});

// currently just a history of `done` events
export const historyTable = sqliteTable('history', {
  id: int().primaryKey({ autoIncrement: true }),
  todoId: int().references(() => todoTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: int({ mode: 'timestamp' }).notNull().default(sql`(unixepoch('subsec'))`),
});
