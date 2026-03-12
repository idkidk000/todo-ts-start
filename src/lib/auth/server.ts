import { apiKey } from '@better-auth/api-key';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '@/lib/drizzle.server';

// https://better-auth.com/docs/installation
// https://better-auth.com/docs/plugins/api-key

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  telemetry: {
    enabled: false,
  },
  user: { modelName: 'userTable' },
  session: { modelName: 'sessionTable' },
  account: { modelName: 'accountTable' },
  verification: { modelName: 'verificationTable' },
  plugins: [
    apiKey({ schema: { apikey: { modelName: 'apiKeyTable' } } }),
    tanstackStartCookies(),
    username({ schema: { user: { modelName: 'userTable' } } }),
  ],
});
