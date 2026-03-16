import { createContext, type ReactNode, useContext } from 'react';
import type { FieldsMeta } from '@/lib/form';

const Context = createContext<FieldsMeta | null>(null);

export function FieldsMetaProvider({ children, fieldsMeta }: { children: ReactNode; fieldsMeta: FieldsMeta }) {
  return <Context value={fieldsMeta}>{children}</Context>;
}

export function useFieldsMeta(): FieldsMeta | null {
  const context = useContext(Context);
  // don't throw on null
  return context;
}
