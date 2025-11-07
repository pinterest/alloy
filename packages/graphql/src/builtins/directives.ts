/**
 * Built-in GraphQL directives.
 * They are part of the GraphQL specification and are automatically available
 * in any GraphQL schema, not requiring any imports.
 */

export const builtInDirectiveNames = [
  "deprecated",
  "skip",
  "include",
  "specifiedBy",
] as const;

export type BuiltInDirectiveName = (typeof builtInDirectiveNames)[number];

/**
 * Built-in GraphQL directives as string constants. Intended to be used when applying directives to fields, types, etc.
 *
 * @example
 * ```tsx
 * <Field name="oldField" type={builtInScalars.String}>
 *   <DirectiveApplication name={builtInDirectives.deprecated} args={{ reason: "Use newField instead" }} />
 * </Field>
 * ```
 * renders to
 * ```graphql
 * oldField: String @deprecated(reason: "Use newField instead")
 * ```
 */
export const builtInDirectives: { [K in BuiltInDirectiveName]: K } =
  Object.fromEntries(builtInDirectiveNames.map((name) => [name, name])) as {
    [K in BuiltInDirectiveName]: K;
  };
