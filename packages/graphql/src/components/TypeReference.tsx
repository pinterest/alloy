import { Children } from "@alloy-js/core";

export interface TypeReferenceProps {
  /**
   * The base type (refkey, string, or nested TypeReference)
   */
  type: Children;

  /**
   * Whether the type is required (non-nullable). Adds `!` suffix.
   */
  required?: boolean;

  /**
   * Whether the type is a list. Wraps in `[]`.
   */
  list?: boolean;
}

/**
 * A component for composing GraphQL type references with modifiers.
 * Composable - nest TypeReference components for complex types.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const userRef = refkey();
 *
 * <>
 *   <TypeReference type={builtInScalars.String} />
 *   <TypeReference type={builtInScalars.String} required />
 *   <TypeReference type={builtInScalars.String} list />
 *   <TypeReference type={builtInScalars.String} list required />
 *   <TypeReference type={<TypeReference type={builtInScalars.String} required />} list />
 *   <TypeReference type={<TypeReference type={builtInScalars.String} required />} list required />
 *   <TypeReference type={<TypeReference type={userRef} required />} list required />
 * </>
 * ```
 * renders to
 * ```graphql
 * String
 * String!
 * [String]
 * [String]!
 * [String!]
 * [String!]!
 * [User!]!
 * ```
 */
export function TypeReference(props: TypeReferenceProps): Children {
  const { type, required, list } = props;

  if (list) {
    return (
      <>
        [{type}]{required && "!"}
      </>
    );
  }

  return (
    <>
      {type}
      {required && "!"}
    </>
  );
}
