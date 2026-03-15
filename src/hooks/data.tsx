import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import SuperJSON from 'superjson';
import type { TodoWithCompletedAt } from '@/lib/schemas';
import { todoWithCompletedAtSelect } from '@/lib/todos';
import type { SseInvalidation } from '@/routes/api/sse';

interface Context {
  todos: TodoWithCompletedAt[];
}

const Context = createContext<Context | null>(null);

// TODO: connect to SSE and perform live patching
export function DataProvider({ children, initialTodos }: { children: ReactNode; initialTodos: TodoWithCompletedAt[] }) {
  const todosQuery = useQuery({ queryKey: ['todos'], queryFn: todoWithCompletedAtSelect, initialData: initialTodos });
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');
    eventSource.addEventListener('open', (event) => {
      console.log('event source open', 'data' in event ? event.data : event);
    });
    eventSource.addEventListener('invalidate', (event) => {
      //TODO: handle history etc
      console.log('event source invalidate', 'data' in event ? event.data : event);
      const { updated, ids }: SseInvalidation = SuperJSON.parse(event.data);
      queryClient.setQueryData(['todos'], (prev: TodoWithCompletedAt[] | undefined) => {
        if (Array.isArray(prev)) return [...prev.filter((item) => !ids.includes(item.id)), ...updated];
        else queryClient.refetchQueries({ queryKey: ['todos'] });
      });
    });
    eventSource.addEventListener('error', (event) => {
      console.log('event source error', 'data' in event ? event.data : event);
    });

    return () => eventSource.close();
  }, [queryClient.refetchQueries, queryClient.setQueryData]);

  const value: Context = useMemo(
    () => ({
      todos: todosQuery.data,
    }),
    [todosQuery.data]
  );

  return <Context value={value}>{children}</Context>;
}

export function useData(): Context {
  const context = useContext(Context);
  if (!context) throw new Error('useData must be used underneath a DataProvider');
  return context;
}
