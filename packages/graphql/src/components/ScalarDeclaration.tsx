import { Declaration as CoreDeclaration, Name, Show } from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { BaseDeclarationProps } from "./common-props.js";

export interface ScalarDeclarationProps extends BaseDeclarationProps {
  // All properties inherited from BaseDeclarationProps
}

/**
 * A scalar type declaration for GraphQL schemas.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <>
 *   <ScalarDeclaration
 *     name="DateTime"
 *     description='"""ISO-8601 date-time string"""'
 *   />
 *   <ScalarDeclaration name="JSON" />
 *   <ScalarDeclaration
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
 * scalar URL @specifiedBy(url: "https://tools.ietf.org/html/rfc3986")
 * ```
 */
export function ScalarDeclaration(props: ScalarDeclarationProps) {
  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "scalar",
  );

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        scalar <Name />
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}

