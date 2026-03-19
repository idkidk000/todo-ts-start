import { sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { userTable } from '@/lib/drizzle.server/schema/better-auth';
import type { Repeat, Time } from '@/lib/schemas';

export const todoTable = sqliteTable(
  'todo',
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    done: int({ mode: 'boolean' }).notNull().default(false),
    snoozed: int({ mode: 'boolean' }).notNull().default(false),
    repeat: text({ mode: 'json' })
      .notNull()
      .default({ mode: 'never' } satisfies Repeat)
      .$type<Repeat>(),
    repeatTime: text({ mode: 'json' })
      .notNull()
      .default({ hour: 0, minute: 0, second: 0, ms: 0 } satisfies Time)
      .$type<Time>(),
    dueAt: int({ mode: 'timestamp_ms' }),
    completedAt: int({ mode: 'timestamp_ms' }),
    createdAt: int({ mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsec') * 1000 as int))`),
    updatedAt: int({ mode: 'timestamp_ms' })
      .notNull()
      .$onUpdate(() => sql`(cast(unixepoch('subsec') * 1000 as int))`),
  },
  (table) => [uniqueIndex('ixUniqueTodo').on(table.userId, table.name)]
);

// currently just a history of `done` events
export const historyTable = sqliteTable('history', {
  id: int().primaryKey({ autoIncrement: true }),
  todoId: int().references(() => todoTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as int))`),
});
