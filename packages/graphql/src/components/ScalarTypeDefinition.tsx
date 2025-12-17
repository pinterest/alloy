import { Declaration as CoreDeclaration, Name, Show } from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { BaseDeclarationProps } from "./common-props.js";
import { wrapDescription } from "./utils.js";

export interface ScalarTypeDefinitionProps extends BaseDeclarationProps {}

/**
 * A scalar type definition for GraphQL schemas.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <>
 *   <ScalarTypeDefinition
 *     name="DateTime"
 *     description="ISO-8601 date-time string"
 *   />
 *   <ScalarTypeDefinition name="JSON" />
 *   <ScalarTypeDefinition
 *     name="URL"
 *     directives={
 *       <Directive
 *         name="specifiedBy"
 *         args={{ url: "https://tools.ietf.org/html/rfc3986" }}
 *       />
 *     }
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * """
 * ISO-8601 date-time string
 * """
 * scalar DateTime
 * scalar JSON
 * scalar URL \@specifiedBy(url: "https://tools.ietf.org/html/rfc3986")
 * ```
 */
export function ScalarTypeDefinition(props: ScalarTypeDefinitionProps) {
  const sym = createGraphQLSymbol(
    props.name,
    { refkeys: props.refkey },
    "scalar",
  );

  const wrappedDescription = wrapDescription(props.description);

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        scalar <Name />
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}
