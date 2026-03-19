import { env } from 'node:process';

import { eq } from 'drizzle-orm';

import { signUpEmail } from '@/lib/better-auth/server';

import 'dotenv/config';
import { db } from '@/lib/drizzle.server';
import { historyTable, todoTable, userTable } from '@/lib/drizzle.server/schema';
import { lowerToSentenceCase } from '@/lib/utils';

const { SEED_USER_USER, SEED_USER_EMAIL, SEED_USER_PASSWORD, SEED_ADMIN_USER, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } =
  env;
if (
  !SEED_USER_USER ||
  !SEED_USER_EMAIL ||
  !SEED_USER_PASSWORD ||
  !SEED_ADMIN_USER ||
  !SEED_ADMIN_EMAIL ||
  !SEED_ADMIN_PASSWORD
)
  throw new Error(`one or more seed vars are undefined. did you run the gen-env script?`);

// deleting a user through betterAuth requires that you're signed in as that user or have the admin role
// assigning the admin role through betterAuth requires that you're signed in as a user which already has the admin role
// https://better-auth.com/docs/plugins/admin
async function createUser(
  email: string,
  username: string,
  password: string,
  admin: boolean
): Promise<Awaited<ReturnType<typeof signUpEmail>>['user']> {
  await db.delete(userTable).where(eq(userTable.email, email));
  const { user } = await signUpEmail({
    body: { email, name: lowerToSentenceCase(username), password, username },
  });
  if (admin) {
    await db.update(userTable).set({ role: 'admin' }).where(eq(userTable.id, user.id));
    user.role = 'admin';
  }
  console.log(user);
  return user;
}

const user = await createUser(SEED_USER_EMAIL, SEED_USER_USER, SEED_USER_PASSWORD, false);
await createUser(SEED_ADMIN_EMAIL, SEED_ADMIN_USER, SEED_ADMIN_PASSWORD, true);

await db
  .insert(todoTable)
  .values(
    [{ name: 'Aaaaa' }, { name: 'Bbbbb' }, { name: 'Ccccc' }, { name: 'Ddddd' }].map(({ name }) => ({
      name,
      userId: user.id,
    }))
  )
  .onConflictDoNothing();

const todos = await db.select({ id: todoTable.id }).from(todoTable);
const history = todos
  .flatMap(({ id }) =>
    Array.from({ length: 5 }, () => {
      const createdAt = new Date();
      createdAt.setMinutes(createdAt.getMinutes() - Math.random() * 10080);
      return { todoId: id, createdAt };
    })
  )
  .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

await db.insert(historyTable).values(history);
