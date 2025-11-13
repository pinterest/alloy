/**
 * Built-in GraphQL scalar types.
 * They are part of the GraphQL specification and are automatically available
 * in any GraphQL schema, not requiring any imports.
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
export const builtInScalars = {
  Int: "Int",
  Float: "Float",
  String: "String",
  Boolean: "Boolean",
  ID: "ID",
} as const;

export type BuiltInScalarName = keyof typeof builtInScalars;

export const builtInScalarNames = Object.keys(
  builtInScalars,
) as BuiltInScalarName[];
