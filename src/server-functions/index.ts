import { createServerFn } from '@tanstack/react-start';
import { and, eq, getTableColumns, inArray, max } from 'drizzle-orm';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/drizzle.server';
import { historyTable, todoTable } from '@/lib/drizzle.server/schema';
import {
  type Todo,
  type TodoDeleteParams,
  type TodoInsertParams,
  type TodoUpdateParams,
  type TodoWithCompletedAt,
  todoDeleteParamsSchema,
  todoInsertParamsSchema,
  todoSelectParamsSchema,
  todoUpdateParamsSchema,
} from '@/lib/schemas';

// DO NOT TYPE THESE OR TANSTACK BREAKS AND GIVES VERY UNHELPFUL ERRORS
// it *looks like* they (along with drizzle) end up in the client bundle when this happens. which obviously doesn't work

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession();
  if (!session) throw new Error('could not get session');
  return session.user.id;
}

export const todoSelect = createServerFn({ method: 'GET' })
  .inputValidator((data) => todoSelectParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await getUserId();
    const result: Todo[] = await db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.userId, userId), data ? inArray(todoTable.id, data) : undefined));
    return result;
  });

export const todoWithCompletedAtSelect = createServerFn({ method: 'GET' })
  .inputValidator((data) => todoSelectParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await getUserId();
    const result: TodoWithCompletedAt[] = await db
      .select({
        ...getTableColumns(todoTable),
        completedAt: max(historyTable.createdAt),
      })
      .from(todoTable)
      .leftJoin(historyTable, eq(historyTable.todoId, todoTable.id))
      .where(and(eq(todoTable.userId, userId), data ? inArray(todoTable.id, data) : undefined))
      .groupBy(todoTable.id);
    return result;
  });
/*
  TODO: get todos with history. history should be an array under each todo
  probably needs json_group_array. see:
   ../uptime/lib/drizzle/queries.ts
   https://sqlite.org/json1.html#jgrouparray
*/

export const todoUpdate = createServerFn({ method: 'POST' })
  .inputValidator((data: TodoUpdateParams) => todoUpdateParamsSchema.parse(data))
  .handler(async ({ data: { id, ...rest } }) => {
    const userId = await getUserId();
    await db
      .update(todoTable)
      .set(rest)
      .where(and(eq(todoTable.userId, userId), eq(todoTable.id, id)));
    if ('done' in rest && rest.done) await db.insert(historyTable).values({ todoId: id });
  });

export const todoInsert = createServerFn({ method: 'POST' })
  .inputValidator((data: TodoInsertParams) => todoInsertParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await getUserId();
    const [{ id }] = await db
      .insert(todoTable)
      .values({ ...data, userId })
      .returning();
    if ('done' in data && data.done) await db.insert(historyTable).values({ todoId: id });
  });

export const todoDelete = createServerFn({ method: 'POST' })
  .inputValidator((data: TodoDeleteParams) => todoDeleteParamsSchema.parse(data))
  .handler(async ({ data: { id } }) => {
    const userId = await getUserId();
    await db.delete(todoTable).where(and(eq(todoTable.userId, userId), eq(todoTable.id, id)));
  });
