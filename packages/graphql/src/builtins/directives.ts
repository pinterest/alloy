import type { DirectiveLocation } from "../components/DirectiveDefinition.js";

/**
 * Metadata for built-in GraphQL directives.
 * Note: All built-in directives are non-repeatable per the GraphQL specification.
 */
export interface BuiltInDirectiveMetadata {
  locations: DirectiveLocation[];
}

/**
 * Metadata for each built-in directive as specified in the GraphQL specification.
 * All built-in directives are non-repeatable.
 * @see https://spec.graphql.org/September2025/#sec-Type-System.Directives
 */
export const builtInDirectiveMetadata: Record<
  string,
  BuiltInDirectiveMetadata
> = {
  deprecated: {
    locations: [
      "FIELD_DEFINITION",
      "ARGUMENT_DEFINITION",
      "INPUT_FIELD_DEFINITION",
      "ENUM_VALUE",
    ],
  },
  skip: {
    locations: ["FIELD", "FRAGMENT_SPREAD", "INLINE_FRAGMENT"],
  },
  include: {
    locations: ["FIELD", "FRAGMENT_SPREAD", "INLINE_FRAGMENT"],
  },
  specifiedBy: {
    locations: ["SCALAR"],
  },
  oneOf: {
    locations: ["INPUT_OBJECT"],
  },
};

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
 * oldField: String @deprecated(reason: "Use newField instead")
 * ```
 */
export const builtInDirectives = {
  deprecated: "deprecated",
  skip: "skip",
  include: "include",
  specifiedBy: "specifiedBy",
  oneOf: "oneOf",
} as const;
