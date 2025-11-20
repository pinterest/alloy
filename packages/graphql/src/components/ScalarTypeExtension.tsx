import {
  Children,
  Declaration as CoreDeclaration,
  Name,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { NamedDeclarationProps } from "./common-props.js";

export interface ScalarTypeExtensionProps extends NamedDeclarationProps {
  /**
   * Directives to add to the scalar type
   */
  directives?: Children;
}

/**
 * A scalar type extension for GraphQL schemas.
 * Extends an existing scalar type with additional directives.
 *
 * @example
 * ```tsx
 * <>
 *   <ScalarTypeExtension
 *     name="DateTime"
 *     directives={
 *       <Directive
 *         name="specifiedBy"
 *         args={{ url: "https://tools.ietf.org/html/rfc3339" }}
 *       />
 *     }
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * extend scalar DateTime @specifiedBy(url: "https://tools.ietf.org/html/rfc3339")
 * ```
 */
export function ScalarTypeExtension(props: ScalarTypeExtensionProps) {
  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "scalar",
  );

  return (
    <CoreDeclaration symbol={sym}>
      extend scalar <Name />
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
    </CoreDeclaration>
  );
}
