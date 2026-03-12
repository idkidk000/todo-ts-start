import { db } from '@/lib/drizzle';
import { historyTable, todoTable } from '@/lib/drizzle/schema';

await db
  .insert(todoTable)
  .values([{ name: 'Aaaaa' }, { name: 'Bbbbb' }, { name: 'Ccccc' }, { name: 'Ddddd' }])
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
