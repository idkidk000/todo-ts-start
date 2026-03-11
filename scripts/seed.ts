import { db } from '@/lib/drizzle';
import { todoTable } from '@/lib/drizzle/schema';

await db.insert(todoTable).values([{ name: 'Aaaaa' }, { name: 'Bbbbb' }, { name: 'Ccccc' }, { name: 'Ddddd' }]);
