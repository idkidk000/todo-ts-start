import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import z from 'zod';
import { Button } from '@/components/button';
import { FormInput } from '@/components/form-input';
import { FormSelect } from '@/components/form-select';

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormSelect,
  },
  formComponents: {
    Button,
  },
});

type DottedFieldPath = string & {};
export type FieldsMeta = Map<DottedFieldPath, { description: string | undefined; required: boolean }>;

/**
 * @param openApiJsonSchema Zod discriminated union exported to JSON schema in OpenAPI 3 format
 * @param kind the discriminator
 * @returns `Map<field name in dot notation, { description: string | undefined, required: boolean }>` for the narrowed schema
 */
export function makeFieldsMeta(openApiJsonSchema: Record<string, unknown>, rootPath?: string): FieldsMeta {
  function recurse(
    fragment: Record<string, unknown>,
    path?: string,
    description?: string | undefined,
    required?: boolean | undefined
  ): undefined | { path: string; description: string | undefined; required: boolean }[] {
    const type =
      'type' in fragment ? fragment.type : 'oneOf' in fragment ? 'oneOf' : 'anyOf' in fragment ? 'anyOf' : null;
    description ??= 'description' in fragment ? (fragment.description as string) : undefined;
    // logger.debugMed({path,type,description,required})
    if (type === null) return;
    if (type === 'anyOf') {
      if (!Array.isArray(fragment.anyOf)) return;
      return fragment.anyOf
        .flatMap((item) => recurse(item as Record<string, unknown>, path, description, required))
        .filter((item) => typeof item !== 'undefined');
    }
    if (type === 'oneOf') {
      if (!Array.isArray(fragment.oneOf)) return;
      return fragment.oneOf
        .flatMap((item) => recurse(item as Record<string, unknown>, path, description, required))
        .filter((item) => typeof item !== 'undefined');
    }
    if (type === 'object') {
      if (!('properties' in fragment)) {
        if (!path) throw new Error('found record at root level');
        return [{ path, description, required: required ?? false }];
      }
      const reqFields = 'required' in fragment ? (fragment.required as string[]) : undefined;
      return Object.entries(fragment.properties as Record<string, Record<string, unknown>>)
        .flatMap(([key, val]) =>
          recurse(val, path ? `${path}.${key}` : key, description, reqFields?.includes(key) ?? required)
        )
        .filter((item) => typeof item !== 'undefined');
    }
    if (!path) throw new Error('root element is not an object');
    return [{ path, description, required: required ?? false }];
  }
  return new Map(recurse(openApiJsonSchema, rootPath)?.map(({ path, ...rest }) => [path, rest]));
}

/**
 * @param openApiJsonSchema Zod discriminated union exported to JSON schema in OpenAPI 3 format
 * @param discriminator the discriminator
 * @returns `Map<field name in dot notation, { description: string | undefined, required: boolean }>` for the narrowed schema
 */
export function makeFieldsMetaFromDiscUnion(
  openApiJsonSchema: { oneOf?: unknown },
  discriminator: string,
  { fieldName, rootPath }: { fieldName: string; rootPath: string } = { fieldName: 'kind', rootPath: 'params' }
): FieldsMeta {
  const narrowed = (openApiJsonSchema.oneOf as unknown as { properties: { [fieldName]: { enum: string[] } } }[]).find(
    (item) => item.properties[fieldName].enum.includes(discriminator)
  );
  if (!narrowed) throw new Error(`could not narrow json schema to ${fieldName}: ${discriminator}`);
  return makeFieldsMeta(narrowed, rootPath);
}

/** wraps a zod schema to help with tanstack form's anger issues */
export function makeZodValidator(zodSchema: {
  safeParse: (data: unknown) =>
    | { success: true }
    | {
        success: false;
        error: { issues: { path: unknown[]; message: string }[] };
      };
}) {
  return function ({ value }: { value: unknown }) {
    console.debug('validating', value);
    const parsed = zodSchema.safeParse(value);
    if (parsed.success) {
      console.info('validation success');
      return null;
    }
    const fields: Record<string, string> = Object.fromEntries(
      parsed.error.issues
        .map((issue) => [
          issue.path.reduce<string>(
            (acc, item) => `${acc}${typeof item === 'number' ? `[${item}]` : `${acc.length ? '.' : ''}${item}`}`,
            ''
          ),
          issue.message,
        ])
        .filter(([path]) => path.length)
    );
    console.warn('validation error', fields);
    return { fields };
  };
}

// https://github.com/colinhacks/zod/issues/4508#issuecomment-2905787171
/**
 * Converts Zod schema to JSON Schema with proper handling of unsupported types
 * @param zodSchema The Zod schema to convert
 * @returns JSON Schema object
 */
export const zodToJsonSchema = <T extends z.ZodTypeAny>(
  zodSchema: T,
  params?: Omit<Required<Parameters<typeof zodSchema.toJSONSchema>[0]>, 'unrepresentable' | 'override'>
) => {
  return z.toJSONSchema(zodSchema, {
    unrepresentable: 'any',
    override: (ctx) => {
      const def = ctx.zodSchema._zod.def;

      if (!def || !def?.type) return;

      switch (def.type) {
        case 'date':
          ctx.jsonSchema.type = 'string';
          ctx.jsonSchema.format = 'date-time';
          break;

        case 'bigint':
          // BigInt can be represented as string to preserve precision
          ctx.jsonSchema.type = 'string';
          ctx.jsonSchema.pattern = '^-?\\d+$';
          ctx.jsonSchema.description = 'BigInt represented as string';
          break;

        case 'symbol':
          ctx.jsonSchema.type = 'string';
          ctx.jsonSchema.description = 'Symbol represented as string';
          break;

        default:
          break;
      }
    },
    ...params,
  });
};
