import { type SubmitEvent, useCallback, useMemo } from 'react';
import z from 'zod';
import { useData } from '@/hooks/data';
import { FieldsMetaProvider } from '@/hooks/fields-meta';
import { getJsonSchemaFields, makeZodValidator, useAppForm } from '@/lib/form';
import { todoInsertParamsSchema } from '@/lib/schemas';
import { todoInsert, todoUpdate } from '@/lib/todos';

// FIXME: schemas need tidying up
const schema = todoInsertParamsSchema.required().extend({ id: z.int().optional() });
type Schema = z.infer<typeof schema>;
const validator = makeZodValidator(schema);
const fieldsMeta = getJsonSchemaFields(schema.toJSONSchema({ target: 'openapi-3.0' }));

export function TodoForm({ todoId }: { todoId?: number }) {
  const { todos } = useData();
  const defaultValues: Schema = useMemo(() => {
    const todo = todoId ? todos.find((item) => item.id === todoId) : null;
    if (todo) return schema.parse(todo);
    return {
      done: false,
      dueAt: new Date(),
      repeat: { mode: 'never' },
      repeatTime: { hour: 0, minute: 0, second: 0, ms: 0 },
      name: '',
      snoozed: false,
    };
  }, [todoId, todos.find]);
  const form = useAppForm({
    validators: {
      onBlur: validator,
      onSubmit: validator,
    },
    defaultValues,
    onSubmit({ value, formApi }) {
      ('id' in value && typeof value.id === 'number' ? todoUpdate({ data: value }) : todoInsert({ data: value })).then(
        () => formApi.reset()
      );
    },
  });

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.handleSubmit();
    },
    [form.handleSubmit]
  );
  return (
    <FieldsMetaProvider fieldsMeta={fieldsMeta}>
      <form className='grid grid-cols-[auto_1fr] gap-4 items-center mx-auto' onSubmit={handleSubmit}>
        <form.AppField name='name'>{(field) => <field.FormInput type='text' />}</form.AppField>
        <form.AppField name='done'>{(field) => <field.FormInput type='checkbox' />}</form.AppField>
        <form.AppField name='dueAt'>{(field) => <field.FormInput type='date' />}</form.AppField>

        <form.Button className='col-span-full mx-auto' type='submit'>
          {defaultValues?.id ? 'Update' : 'Create'}
        </form.Button>
      </form>
    </FieldsMetaProvider>
  );
}
