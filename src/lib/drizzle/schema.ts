import { sql } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const todoTable = sqliteTable('todo', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  done: int({ mode: 'boolean' }).default(false),
  // subsec modifier returns a float. drizzle doesn't allow floats (real) to be used as a timestamp. but it does correctly handle float timestamps so it's maybe fine i guess???
  createdAt: int({ mode: 'timestamp' }).notNull().default(sql`(unixepoch('subsec'))`),
  updatedAt: int({ mode: 'timestamp' })
    .notNull()
    .$onUpdate(() => sql`(unixepoch('subsec'))`),
});
