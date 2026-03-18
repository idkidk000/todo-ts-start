import { useStore } from '@tanstack/react-form';
import { type SubmitEvent, useCallback, useEffect, useMemo } from 'react';
import z from 'zod';
import { useData } from '@/hooks/data';
import { FieldsMetaProvider } from '@/hooks/fields-meta';
import { makeFieldsMeta, makeFieldsMetaFromDiscUnion, makeZodValidator, useAppForm, zodToJsonSchema } from '@/lib/form';
import { repeatModes, repeatSchema, type TodoUpdateParams, todoInsertParamsSchema, weekDays } from '@/lib/schemas';
import { todoDelete, todoInsert, todoUpdate } from '@/lib/todos';
import { camelToSentenceCase } from '@/lib/utils';

// FIXME: schemas need tidying up
const schema = todoInsertParamsSchema.required().extend({ id: z.int().optional() });
type Schema = z.infer<typeof schema>;
const validator = makeZodValidator(schema);

const todoJsonSchema = zodToJsonSchema(schema, { target: 'openapi-3.0' });
const todoFieldsMeta = makeFieldsMeta(todoJsonSchema);

const repeatJsonSchema = zodToJsonSchema(repeatSchema, { target: 'openapi-3.0' });
console.log('repeatJsonSchema', repeatJsonSchema);

export function TodoForm({ todoId, onCompleted }: { todoId?: number; onCompleted?: () => void }) {
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
      ('id' in value && typeof value.id === 'number'
        ? todoUpdate({ data: value as TodoUpdateParams })
        : todoInsert({ data: value })
      ).then(() => {
        formApi.reset();
        onCompleted?.();
      });
    },
  });

  useEffect(() => form.reset(defaultValues), [defaultValues, form.reset]);

  const repeatMode = useStore(form.store, (state) => state.values.repeat.mode);

  const repeatFieldsMeta = useMemo(() => {
    const result = makeFieldsMetaFromDiscUnion(repeatJsonSchema, repeatMode, { fieldName: 'mode', rootPath: 'repeat' });
    console.log('repeatFieldsMeta', result);
    return result;
  }, [repeatMode]);

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.handleSubmit();
    },
    [form.handleSubmit]
  );

  const handleDeleteClick = useCallback(() => {
    if (!defaultValues.id) return;
    todoDelete({ data: { id: defaultValues.id } }).then(() => {
      form.reset();
      onCompleted?.();
    });
  }, [defaultValues.id, form.reset, onCompleted]);

  return (
    <FieldsMetaProvider fieldsMeta={todoFieldsMeta}>
      <form
        className='grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_1fr] lg:grid-cols-[auto_1fr_auto_1fr_auto_1fr] gap-4 items-center mx-auto'
        onSubmit={handleSubmit}
      >
        <form.AppField name='name'>{(field) => <field.FormInput type='text' />}</form.AppField>
        <form.AppField name='done'>{(field) => <field.FormInput type='checkbox' />}</form.AppField>
        <form.AppField name='dueAt'>{(field) => <field.FormInput type='date' />}</form.AppField>
        <form.AppField name='repeat.mode'>
          {(field) => (
            <field.FormSelect
              type='string'
              options={repeatModes.map((value) => ({ label: camelToSentenceCase(value), value }))}
            />
          )}
        </form.AppField>

        <FieldsMetaProvider fieldsMeta={repeatFieldsMeta}>
          <form.AppField name='repeat.count'>{(field) => <field.FormInput type='number' />}</form.AppField>
          <form.AppField name='repeat.fromDue'>{(field) => <field.FormInput type='checkbox' />}</form.AppField>
          <form.AppField name='repeat.monthDay'>{(field) => <field.FormInput type='number' />}</form.AppField>
          <form.AppField name='repeat.weekDay'>
            {(field) => <field.FormSelect type='number' options={weekDays} />}
          </form.AppField>
          <form.AppField name='repeat.weekDays'>
            {(field) => <field.FormSelect type='number' options={weekDays} multiple />}
          </form.AppField>
          {/* TODO: repeat.monthDays and repeat.yearDays need another custom input type. maybe an input[type="text"] whose values are split on /[\s,]+/ and mapped to Number. or a combobox */}
        </FieldsMetaProvider>

        <div className='col-span-full flex justify-center *:grow gap-2 md:w-md md:mx-auto'>
          <form.Button type='submit'>{defaultValues?.id ? 'Update' : 'Create'}</form.Button>
          <form.Button type='reset' variant='warning'>
            Reset
          </form.Button>
          {defaultValues.id && (
            <form.Button type='button' variant='danger' onClick={handleDeleteClick}>
              Delete
            </form.Button>
          )}
        </div>
      </form>
    </FieldsMetaProvider>
  );
}
