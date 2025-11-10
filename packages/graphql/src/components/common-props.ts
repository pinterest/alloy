import { Children, Refkey } from "@alloy-js/core";

/**
 * Base properties shared by GraphQL declaration components.
 */
export interface BaseDeclarationProps {
  /**
   * The name of the declaration
   */
  name: string;
  /**
   * Description for the declaration
   */
  description?: Children;
  /**
   * Directives to apply to the declaration
   */
  directives?: Children;
  /**
   * Reference key for this symbol
   */
  refkey?: Refkey;
}

