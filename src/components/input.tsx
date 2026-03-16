import { Eye, EyeOff } from 'lucide-react';
import { type ChangeEvent, type ComponentProps, type FocusEvent, type ReactNode, useCallback, useState } from 'react';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';

export function Input<T extends string | number | boolean | Date>({
  className,
  type,
  onBlur,
  onChange,
  value,
  onValueChange,
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'type' | 'checked'> & {
  value?: T | (T extends Date ? null : never);
  onValueChange?: (value: T | (T extends Date ? null : never)) => void;
  type: T extends boolean
    ? 'checkbox'
    : T extends number
      ? 'number'
      : T extends Date
        ? 'date'
        : 'text' | 'password' | 'textarea';
}) {
  const [show, setShow] = useState(false);

  const handleClick = useCallback(() => setShow((prev) => !prev), []);

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setShow(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (type === 'checkbox') onValueChange?.(event.target.checked as T);
      else if (type === 'number') onValueChange?.(event.target.valueAsNumber as T);
      // date is nullable
      else if (type === 'date') onValueChange?.(event.target.valueAsDate as unknown as T);
      else onValueChange?.(event.target.value as T);
      onChange?.(event);
    },
    [onChange, onValueChange, type]
  );

  if (type === 'password') {
    return (
      <InputGroup>
        <input
          type={show ? 'text' : type}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            'border border-border shadow-sm rounded-md px-4 py-1 focus-visible:outline-none w-full',
            className
          )}
          value={value as string}
          {...props}
        />
        <Button
          size='sm'
          className='rounded-none'
          onClick={handleClick}
          role='checkbox'
          aria-checked={show}
          aria-description={`Password is ${show ? 'shown' : 'hidden'}`}
        >
          {show ? <Eye /> : <EyeOff />}
        </Button>
      </InputGroup>
    );
  }

  if (type === 'checkbox') {
    return (
      <input
        type={type}
        onBlur={onBlur}
        onChange={handleChange}
        className={cn(
          'border border-border shadow-sm rounded-md px-4 py-1 outline-primary focus-visible:outline-2 me-auto',
          className
        )}
        checked={value as boolean}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      onBlur={onBlur}
      onChange={handleChange}
      className={cn(
        'border border-border shadow-sm rounded-md px-4 py-1 outline-primary focus-visible:outline-2',
        className
      )}
      value={typeof value === 'string' ? value : String(value)}
      {...props}
    />
  );
}

export function InputGroup({ className, children, ...props }: ComponentProps<'div'> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex focus-within:outline-2 outline-primary rounded-md *:rounded-md *:not-first:rounded-s-none *:not-last:rounded-e-none *:not-first:border-s-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
