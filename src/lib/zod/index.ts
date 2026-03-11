import z from 'zod';

export const todoSchema = z.object({
  id: z.int(),
  name: z.string(),
  done: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Todo = z.infer<typeof todoSchema>;

export const todoInsertSchema = todoSchema.pick({ name: true, done: true }).partial({ done: true });
export type TodoInsert = z.infer<typeof todoInsertSchema>;

export const todoUpdateSchema = todoSchema
  .pick({ id: true, done: true, name: true })
  .partial({ done: true, name: true });
export type TodoUpdate = z.infer<typeof todoUpdateSchema>;

export const todoDeleteSchema = todoSchema.pick({ id: true });
export type TodoDelete = z.infer<typeof todoDeleteSchema>;
