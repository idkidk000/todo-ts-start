import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { todoTable } from '@/lib/drizzle/schema';
import {
  type TodoDelete,
  type TodoInsert,
  type TodoUpdate,
  todoDeleteSchema,
  todoInsertSchema,
  todoUpdateSchema,
} from '@/lib/zod';

export const todosGetFn = createServerFn({
  method: 'GET',
}).handler(async () => await db.select().from(todoTable));

export const todoUpdateFn = createServerFn({ method: 'POST' })
  .inputValidator((data: TodoUpdate) => todoUpdateSchema.parse(data))
  .handler(async ({ data: { id, ...rest } }) => {
    await db.update(todoTable).set(rest).where(eq(todoTable.id, id));
  });

export const todoInsertFn = createServerFn({ method: 'POST' })
  .inputValidator((data: TodoInsert) => todoInsertSchema.parse(data))
  .handler(async ({ data }) => {
    await db.insert(todoTable).values(data);
  });

export const todoDeleteFn = createServerFn({ method: 'POST' })
  .inputValidator((data: TodoDelete) => todoDeleteSchema.parse(data))
  .handler(async ({ data: { id } }) => {
    await db.delete(todoTable).where(eq(todoTable.id, id));
  });
