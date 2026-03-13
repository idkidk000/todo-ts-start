import { apiKey } from '@better-auth/api-key';
import { name } from '@root/package.json';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, username } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '@/lib/drizzle.server';

// https://better-auth.com/docs/installation
// https://better-auth.com/docs/plugins/api-key

export const auth = betterAuth({
  appName: name,
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  telemetry: { enabled: false },
  user: { deleteUser: { enabled: true }, modelName: 'userTable' },
  session: { modelName: 'sessionTable' },
  account: { modelName: 'accountTable' },
  verification: { modelName: 'verificationTable' },
  plugins: [admin(), apiKey({ schema: { apikey: { modelName: 'apiKeyTable' } } }), tanstackStartCookies(), username()],
});
