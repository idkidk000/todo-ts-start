import { apiKeyClient } from '@better-auth/api-key/client';
import { adminClient, usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// https://better-auth.com/docs/installation

export const { useSession, signIn, signOut, signUp, admin, apiKey, getSession } = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: 'http://localhost:3000',
  plugins: [adminClient(), apiKeyClient(), usernameClient()],
});
