/**
 * Built-in GraphQL directives.
 * They are part of the GraphQL specification and are automatically available
 * in any GraphQL schema, not requiring any imports.
 *
 * @example
 * ```tsx
 * <Field name="oldField" type={builtInScalars.String}>
 *   <Directive name={builtInDirectives.deprecated} args={{ reason: "Use newField instead" }} />
 * </Field>
 * ```
 * renders to
 * ```graphql
 * oldField: String \@deprecated(reason: "Use newField instead")
 * ```
 */
export const builtInDirectives = {
  deprecated: "deprecated",
  skip: "skip",
  include: "include",
  specifiedBy: "specifiedBy",
  oneOf: "oneOf",
} as const;

export type BuiltInDirectiveName = keyof typeof builtInDirectives;

export const builtInDirectiveNames = Object.keys(
  builtInDirectives,
) as BuiltInDirectiveName[];
