import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const ENV_FILE = '.env';
const SECRET_LENGTH = 32;
const PASSWORD_LENGTH = 8;
const SEED_ADMIN_USER = 'admin';
const SEED_USER_USER = 'user';
const SEED_DOMAIN = 'example.org';

function genPassword(length: number): string {
  return randomBytes(Math.ceil(length / 1.333))
    .toString('base64url')
    .slice(0, length);
}

const entries = {
  BETTER_AUTH_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: genPassword(SECRET_LENGTH),

  SEED_ADMIN_USER,
  SEED_ADMIN_EMAIL: `${SEED_ADMIN_USER}@${SEED_DOMAIN}`,
  SEED_ADMIN_PASSWORD: genPassword(PASSWORD_LENGTH),

  SEED_USER_USER,
  SEED_USER_EMAIL: `${SEED_USER_USER}@${SEED_DOMAIN}`,
  SEED_USER_PASSWORD: genPassword(PASSWORD_LENGTH),
} as const;

writeFileSync(
  ENV_FILE,
  Object.entries(entries)
    .map(([key, val]) => `${key}=${val}`)
    .join('\n'),
  { encoding: 'utf-8' }
);

console.log('wrote', ENV_FILE);
