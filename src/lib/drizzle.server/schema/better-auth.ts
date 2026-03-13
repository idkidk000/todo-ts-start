import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// https://better-auth.com/docs/concepts/database#core-schema

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
