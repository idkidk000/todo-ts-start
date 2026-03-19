import z from 'zod';

export const weekDays = (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map(
  (label, value) => ({ value, label })
);
export type WeekDayName = (typeof weekDays)[number]['label'];

export const repeatSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('never').describe('Do not repeat'),
  }),
  z.object({
    mode: z.literal('days').describe('Repeat every n days'),
    count: z.int().min(1).describe('Days between occurrences'),
    fromDue: z.boolean().default(false).describe('Schedule from due date rather than completed date'),
  }),
  z.object({
    mode: z.literal('weeks').describe('Repeat every n weeks'),
    count: z.int().min(1).describe('Weeks between occurrences'),
    fromDue: z.boolean().default(false).describe('Schedule from due date rather than completed date'),
    weekDay: z.int().min(0).max(6).optional().describe('Optional day of week'),
  }),
  z.object({
    mode: z.literal('months').describe('Repeat every n months'),
    count: z.int().min(1).describe('Months between occurrences'),
    fromDue: z.boolean().default(false).describe('Schedule from due date rather than completed date'),
    monthDay: z
      .union([z.int().min(1).max(31), z.int().min(-31).max(-1)])
      .optional()
      .describe('Optional day of month. Negative values are accepted'),
  }),
  z.object({
    mode: z.literal('weekDays').describe('Repeat on selected days of the week'),
    weekDays: z.array(z.int().min(0).max(6)).min(1).describe('Week days'),
  }),
  z.object({
    mode: z.literal('monthDays').describe('Repeat on selected days of the month'),
    monthDays: z
      .array(z.union([z.int().min(1).max(31), z.int().min(-31).max(-1)]))
      .min(1)
      .describe('Month days. Negative values are accepted'),
  }),
  z.object({
    mode: z.literal('yearDays').describe('Repeat on selected days of the year'),
    yearDays: z.array(z.int().min(1).max(365)).min(1).describe('Year days'),
  }),
]);
export type Repeat = z.infer<typeof repeatSchema>;
export const repeatModes: Repeat['mode'][] = ['never', 'days', 'weeks', 'months', 'monthDays', 'weekDays', 'yearDays'];
export function repeatToString(value: Repeat): string {
  const tokens: string[] = [
    value.mode === 'days' ? (value.count > 1 ? `Every ${value.count} days` : 'Every day') : null,
    value.mode === 'weeks' ? (value.count > 1 ? `Every ${value.count} weeks` : 'Every week') : null,
    value.mode === 'months' ? (value.count > 1 ? `Every ${value.count} months` : 'Every month') : null,

    value.mode === 'weekDays' ? value.weekDays.map((weekDay) => weekDays[weekDay].label).join(', ') : null,
    value.mode === 'monthDays' ? `Month days ${value.monthDays.join(', ')}` : null,
    value.mode === 'yearDays' ? `Year days ${value.yearDays.join(', ')}` : null,

    `weekDay` in value && typeof value.weekDay === 'number' ? `on ${weekDays[value.weekDay]}` : null,
    `monthDay` in value && typeof value.monthDay === 'number' ? `on day ${value.monthDay}` : null,
    `fromDue` in value && value.fromDue ? 'from due date' : null,
  ].filter((token) => token !== null);
  return tokens.length ? tokens.join(' ') : 'Never';
}

export const timeSchema = z.object({
  hour: z.int().min(0).max(23).default(0),
  minute: z.int().min(0).max(59).default(0),
  second: z.int().min(0).max(59).default(0),
  ms: z.int().min(0).max(999).default(0),
});
export type Time = z.infer<typeof timeSchema>;

export const todoSchema = z.object({
  id: z.int().describe('Unique identifier'),
  userId: z.string().length(32).describe('User identifier'),
  name: z.string().min(4).describe('Todo name'),
  done: z.boolean().describe('Is the todo done'),
  snoozed: z.boolean().describe('Is the todo snoozed'),
  repeat: repeatSchema.describe('Repeat behaviour'),
  repeatTime: timeSchema.describe('Repeat time'),
  dueAt: z.date().nullable().describe('Due date'),
  completedAt: z.date().nullable().describe('Last completed date'),
  createdAt: z.date().describe('Created date'),
  updatedAt: z.date().describe('Updated date'),
});
export type Todo = z.infer<typeof todoSchema>;

export const todoInsertParamsSchema = todoSchema
  .omit({ createdAt: true, updatedAt: true, userId: true, id: true, completedAt: true })
  .partial({ done: true });
export type TodoInsertParams = z.infer<typeof todoInsertParamsSchema>;

export const todoUpdateParamsSchema = todoSchema
  .omit({ createdAt: true, updatedAt: true, userId: true, completedAt: true })
  .partial()
  .required({ id: true });
export type TodoUpdateParams = z.infer<typeof todoUpdateParamsSchema>;

export const todoDeleteParamsSchema = todoSchema.pick({ id: true });
export type TodoDeleteParams = z.infer<typeof todoDeleteParamsSchema>;

export const todoSelectParamsSchema = z.array(z.int()).optional();
export type TodoSelectParams = z.infer<typeof todoSelectParamsSchema>;

export const historySchema = z.object({
  id: z.int().describe('Unique identifier'),
  todoId: z.int().describe('Identifier of the related todo'),
  createdAt: z.date().describe('Date of the history entry'),
});
export type History = z.infer<typeof historySchema>;

export const historyWithTodoSchema = historySchema.omit({ todoId: true }).extend({ todo: todoSchema });
export type HistoryWithTodo = z.infer<typeof historyWithTodoSchema>;

export const todoWithHistorySchema = todoSchema.extend({
  history: historySchema.omit({ todoId: true }),
});
export type TodoWithHistory = z.infer<typeof todoWithHistorySchema>;
