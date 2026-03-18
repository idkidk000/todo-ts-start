import { type ChangeEvent, type ComponentPropsWithoutRef, type RefObject, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// TODO: add popover and make a custom component
export function Select<T extends string | number, M extends boolean>({
  className,
  onChange,
  type,
  onValueChange,
  options,
  multiple,
  value,
  ref,
  ...props
}: Omit<ComponentPropsWithoutRef<'select'>, 'children' | 'value' | 'multiple'> & {
  type: T extends string ? 'string' : T extends number ? 'number' : never;
  value?: M extends true ? T[] : T;
  onValueChange?: (value: M extends true ? T[] : T) => void;
  options?: { value: T; label: string }[];
  multiple?: M;
  ref?: RefObject<HTMLSelectElement | null>;
}) {
  const localRef = useRef<HTMLSelectElement | null>(null);
  ref ??= localRef;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (multiple) {
        // the `select` dom primitive is quite bad
        const values = [...event.target.querySelectorAll('option')]
          .filter((option) => option.selected)
          .map((option) => (type === 'number' ? Number(option.value) : option.value)) as M extends true ? T[] : T;
        console.log('select multiple handleChange', values);
        onValueChange?.(values);
      } else {
        const value = type === 'number' ? Number(event.target.value) : event.target.value;
        console.log('select single handleChange', value);
        onValueChange?.(value as M extends true ? T[] : T);
      }
      onChange?.(event);
    },
    [onChange, onValueChange, type, multiple]
  );

  // the `select` dom primitive is quite bad
  useEffect(() => {
    console.log('select value useEffect', ref.current, value, Array.isArray(value));
    if (!ref.current || !Array.isArray(value)) return;
    for (const option of ref.current.querySelectorAll('option'))
      option.selected = value.includes((type === 'number' ? Number(option.value) : option.value) as T);
  }, [value, ref.current, type]);

  return (
    <select
      className={cn(
        'border border-border shadow-sm rounded-md px-4 py-1 outline-primary focus-visible:outline-2',
        className
      )}
      onChange={handleChange}
      multiple={multiple}
      value={Array.isArray(value) ? undefined : value}
      ref={ref}
      {...props}
    >
      {options?.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
