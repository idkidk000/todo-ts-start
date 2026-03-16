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
}: Omit<ComponentProps<typeof Input<T>>, 'placeholder' | 'value' | 'onValueChange' | 'onBlur'> & {
  label?: string;
  placeholder?: string;
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
        <Input
          id={id}
          value={field.state.value}
          onValueChange={field.handleChange}
          onBlur={field.handleBlur}
          placeholder={placeholder ?? fieldLabel}
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
