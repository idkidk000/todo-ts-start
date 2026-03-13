import { sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { Repeat } from '@/lib/schemas';

// https://better-auth.com/docs/concepts/database#core-schema
// #region betterauth
export const userTable = sqliteTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: int().notNull(),
  image: text(),
  // https://better-auth.com/docs/plugins/username#schema
  username: text().notNull(),
  displayUsername: text().notNull(),
  // https://better-auth.com/docs/plugins/admin#schema
  role: text(),
  banned: int(),
  banReason: text(),
  banExpires: int({ mode: 'timestamp_ms' }),
  createdAt: int({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: int({ mode: 'timestamp_ms' }).notNull(),
});

export const sessionTable = sqliteTable('session', {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  token: text().notNull(),
  expiresAt: int({ mode: 'timestamp_ms' }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  // https://better-auth.com/docs/plugins/admin#schema
  impersonatedBy: text(),
  createdAt: int({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: int({ mode: 'timestamp_ms' }).notNull(),
});

export const accountTable = sqliteTable('account', {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  accountId: text().notNull(),
  providerId: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  accessTokenExpiresAt: int({ mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: int({ mode: 'timestamp_ms' }),
  scope: text(),
  idToken: text(),
  password: text(),
  createdAt: int({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: int({ mode: 'timestamp_ms' }).notNull(),
});

export const verificationTable = sqliteTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: int({ mode: 'timestamp_ms' }).notNull(),
  createdAt: int({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: int({ mode: 'timestamp_ms' }).notNull(),
});

// https://better-auth.com/docs/plugins/api-key/reference#schema
// TODO: write UI for creating/displaying these
export const apiKeyTable = sqliteTable('apiKey', {
  id: text().primaryKey(),
  configId: text().notNull(),
  name: text(),
  start: text(),
  prefix: text(),
  key: text().notNull(),
  referenceId: text().notNull(),
  refillInterval: int(),
  refillAmount: int(),
  lastRefillAt: int({ mode: 'timestamp_ms' }),
  enabled: int().notNull(),
  rateLimitEnabled: int().notNull(),
  rateLimitTimeWindow: int(),
  rateLimitMax: int(),
  requestCount: int().notNull(),
  remaining: int(),
  lastRequest: int({ mode: 'timestamp_ms' }),
  expiresAt: int({ mode: 'timestamp_ms' }),
  createdAt: int({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: int({ mode: 'timestamp_ms' }).notNull(),
  permissions: text(),
  metadata: text({ mode: 'json' }),
});

// #endregion

// #region todos
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
    createdAt: int({ mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as int))`),
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
  createdAt: int({ mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as int))`),
});
// #endregion
