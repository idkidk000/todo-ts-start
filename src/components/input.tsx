import { Eye, EyeOff } from 'lucide-react';
import { type ComponentProps, type FocusEvent, type ReactNode, useCallback, useRef, useState } from 'react';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';

export function Input({ className, type, ref, onBlur, ...props }: ComponentProps<'input'>) {
  const localRef = useRef<HTMLInputElement | null>(null);
  ref ??= localRef;
  const [show, setShow] = useState(false);

  const handleClick = useCallback(() => setShow((prev) => !prev), []);

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setShow(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  if (type === 'password') {
    return (
      <InputGroup>
        <input
          type={show ? 'text' : type}
          ref={ref}
          onBlur={handleBlur}
          className={cn('border border-border shadow-sm rounded-md px-4 py-1 focus-visible:outline-none', className)}
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

  return (
    <input
      type={type}
      ref={ref}
      onBlur={onBlur}
      className={cn(
        'border border-border shadow-sm rounded-md px-4 py-1 outline-primary focus-visible:outline-2',
        type === 'checkbox' && 'me-auto',
        className
      )}
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
