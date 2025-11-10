import { Declaration as CoreDeclaration, Name, Show } from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { BaseDeclarationProps } from "./common-props.js";

export interface EnumValueProps extends BaseDeclarationProps {
  // All properties inherited from BaseDeclarationProps
}

/**
 * An enum value declaration for GraphQL enum types.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <>
 *   <EnumValue name="ACTIVE" description='"""Currently active"""' />
 *   <EnumValue name="INACTIVE" />
 *   <EnumValue
 *     name="DEPRECATED_STATUS"
 *     directives={
 *       <Directive
 *         name={builtInDirectives.deprecated}
 *         args={{ reason: "Use INACTIVE instead" }}
 *       />
 *     }
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * """
 * Currently active
 * """
 * ACTIVE
 * INACTIVE
 * DEPRECATED_STATUS \@deprecated(reason: "Use INACTIVE instead")
 * ```
 */
export function EnumValue(props: EnumValueProps) {
  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "enumValue",
  );

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        <Name />
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}

