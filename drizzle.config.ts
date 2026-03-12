import 'dotenv/config';
import { env } from 'node:process';
import { defineConfig } from 'drizzle-kit';

const url = env.DB_FILE_NAME ?? 'file:.local/data.db';

export default defineConfig({
  out: './migrations',
  schema: './src/lib/drizzle.server/schema.ts',
  dialect: 'sqlite',
  dbCredentials: { url },
  strict: true,
});
