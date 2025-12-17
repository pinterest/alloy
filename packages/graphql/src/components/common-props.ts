import { Children, Refkey } from "@alloy-js/core";

/**
 * Minimal properties for any named GraphQL declaration.
 */
export interface NamedDeclarationProps {
  /**
   * The name of the declaration
   */
  name: string;
  /**
   * Reference key for this symbol
   */
  refkey?: Refkey;
}

/**
 * Standard properties for most GraphQL declaration components.
 */
export interface BaseDeclarationProps extends NamedDeclarationProps {
  /**
   * Description for the declaration
   */
  description?: Children;
  /**
   * Directives to apply to the declaration
   */
  directives?: Children;
}

/**
 * Properties for declarations that have a type.
 */
export interface TypedBaseDeclarationProps extends BaseDeclarationProps {
  /**
   * The type of the declaration. Must be a TypeReference component.
   *
   * @example
   * ```tsx
   * // Simple type
   * <TypeReference type={builtInScalars.String} />
   *
   * // Required type (non-nullable)
   * <TypeReference type={builtInScalars.ID} required />
   *
   * // List type
   * <TypeReference type={builtInScalars.String} list />
   *
   * // Required list of required items: [String!]!
   * <TypeReference type={<TypeReference type={builtInScalars.String} required />} list required />
   *
   * // Custom type reference
   * <TypeReference type={userRef} required />
   * ```
   */
  type: Children;
}
