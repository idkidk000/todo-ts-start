import { Activity, type ComponentProps, useId } from 'react';

import { Input } from '@/components/input';
import { useFieldsMeta } from '@/hooks/fields-meta';
import { useFieldContext } from '@/lib/form';
import { camelToSentenceCase } from '@/lib/utils';

export function FormInput<T extends string | number | boolean | Date>({
  label,
  placeholder,
  description,
  ...props
}: Omit<ComponentProps<typeof Input<T>>, 'value' | 'onValueChange' | 'onBlur'> & {
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
      <div className='col-span-2 grid slide-in-up grid-cols-subgrid items-center gap-y-2'>
        <label htmlFor={id} className='font-semibold'>
          {fieldLabel}
        </label>
        <Input
          id={id}
          value={field.state.value}
          onValueChange={field.handleChange as (value: T | (T extends Date ? null : never)) => void}
          onBlur={field.handleBlur}
          placeholder={placeholder ?? fieldLabel}
          {...props}
        />
        {field.state.meta.errors.length && field.state.meta.isTouched ? (
          <span className='col-start-2 slide-in-up text-sm text-danger' role='alert'>
            {field.state.meta.errors.join('. ')}
          </span>
        ) : fieldDescription ? (
          <span className='col-start-2 slide-in-up text-sm text-muted'>{fieldDescription}</span>
        ) : null}
      </div>
    </Activity>
  );
}
