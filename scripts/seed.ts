import { auth } from '@/lib/auth/server';
import { db } from '@/lib/drizzle.server';
import { historyTable, todoTable } from '@/lib/drizzle.server/schema';

const SEED_USER = 'test';
const SEED_DOMAIN = 'example.org';
const SEED_PASSWORD = 'password';
const SEED_EMAIL = `${SEED_USER}@${SEED_DOMAIN}`;

const { user } = await auth.api
  .signInEmail({
    body: {
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
    },
  })
  .catch((err) => {
    console.error('error signing in', err);
    console.info('trying sign up');
    return auth.api.signUpEmail({
      body: {
        email: SEED_EMAIL,
        name: SEED_USER,
        password: SEED_PASSWORD,
        username: SEED_USER,
      },
    });
  });

console.log(user);

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
