/**
 * Built-in GraphQL scalar types.
 * They are part of the GraphQL specification and are automatically available
 * in any GraphQL schema, not requiring any imports.
 */

export const builtInScalarNames = [
  "Int",
  "Float",
  "String",
  "Boolean",
  "ID",
] as const;

export type BuiltInScalarName = (typeof builtInScalarNames)[number];

/**
 * Built-in GraphQL scalars as string constants. Intended to be used when defining field types, argument types, etc.
 *
 * @example
 * ```tsx
 * <Field name="id" type={builtInScalars.ID} />
 * <Field name="name" type={builtInScalars.String} />
 * <Field name="age" type={builtInScalars.Int} />
 * ```
 * renders to
 * ```graphql
 * id: ID
 * name: String
 * age: Int
 * ```
 */
export const builtInScalars: { [K in BuiltInScalarName]: K } =
  Object.fromEntries(builtInScalarNames.map((name) => [name, name])) as {
    [K in BuiltInScalarName]: K;
  };
