import { Activity, type ComponentProps, useId } from 'react';
import { Select } from '@/components/select';
import { useFieldsMeta } from '@/hooks/fields-meta';
import { useFieldContext } from '@/lib/form';
import { camelToSentenceCase } from '@/lib/utils';

export function FormSelect<T extends string | number, M extends boolean>({
  label,
  // the `select` dom primitive does not have a placeholder
  // placeholder,
  description,
  ...props
}: Omit<ComponentProps<typeof Select<T, M>>, 'value' | 'onValueChange' | 'onBlur'> & {
  label?: string;
  description?: string;
}) {
  const id = useId();
  const field = useFieldContext<T>();
  const fieldsMeta = useFieldsMeta();
  const fieldMeta = fieldsMeta?.get(field.name);
  const fieldDescription =
    description ??
    (fieldMeta?.description ? `${fieldMeta.description}${fieldMeta.required ? '' : ' (optional)'}` : undefined);
  const fieldLabel = label ?? camelToSentenceCase(field.name.split('.').toReversed()[0]);

  return (
    <Activity mode={fieldsMeta && !fieldsMeta.has(field.name) ? 'hidden' : 'visible'}>
      <div className='grid grid-cols-subgrid col-span-2 items-center gap-y-2 slide-in-up'>
        <label htmlFor={id} className='font-semibold'>
          {fieldLabel}
        </label>
        <Select
          id={id}
          value={field.state.value as M extends true ? T[] : T}
          onValueChange={field.handleChange as (value: M extends true ? T[] : T) => void}
          onBlur={field.handleBlur}
          // placeholder={placeholder ?? fieldLabel}
          {...props}
        />
        {field.state.meta.errors.length && field.state.meta.isTouched ? (
          <span className='col-start-2 slide-in-up text-danger text-sm' role='alert'>
            {field.state.meta.errors.join('. ')}
          </span>
        ) : fieldDescription ? (
          <span className='col-start-2 slide-in-up text-muted text-sm'>{fieldDescription}</span>
        ) : null}
      </div>
    </Activity>
  );
}
