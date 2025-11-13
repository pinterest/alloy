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
   * The type of the declaration. Type modifiers like non-null (!) and list ([])
   * should be included in the type string itself.
   *
   * Can be:
   * - A string literal: `"String"`, `"ID!"`, `"[String!]!"`
   * - A built-in scalar: `builtInScalars.String`
   * - A refkey to a user-defined type
   * - A code template for composition: code`[${typeRef}]!`
   */
  type: Children;
}
