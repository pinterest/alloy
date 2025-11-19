import {
  Children,
  childrenArray,
  Declaration as CoreDeclaration,
  createContentSlot,
  Indent,
  List,
  MemberScope,
  Name,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { GraphQLMemberScope, useGraphQLScope } from "../symbols/index.js";
import { BaseDeclarationProps } from "./common-props.js";
import { wrapDescription } from "./utils.js";

export interface EnumTypeDefinitionProps extends BaseDeclarationProps {
  /**
   * Enum values (EnumValue components)
   */
  children?: Children;
}

/**
 * An enum type definition for GraphQL schemas.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <EnumTypeDefinition
 *   name="Status"
 *   description="User status"
 * >
 *   <EnumValue name="ACTIVE" description="Currently active" />
 *   <EnumValue name="INACTIVE" />
 *   <EnumValue
 *     name="PENDING"
 *     directives={
 *       <Directive
 *         name={builtInDirectives.deprecated}
 *         args={{ reason: "Use INACTIVE instead" }}
 *       />
 *     }
 *   />
 * </EnumTypeDefinition>
 * ```
 * renders to
 * ```graphql
 * """
 * User status
 * """
 * enum Status {
 *   """
 *   Currently active
 *   """
 *   ACTIVE
 *   INACTIVE
 *   PENDING \@deprecated(reason: "Use INACTIVE instead")
 * }
 * ```
 */
export function EnumTypeDefinition(props: EnumTypeDefinitionProps) {
  const parentScope = useGraphQLScope();

  // Validate that enum has at least one value
  const children = childrenArray(() => props.children);
  if (children.length === 0) {
    throw new Error(
      `Enum "${props.name}" must have at least one value. Empty enums are not valid in GraphQL.`,
    );
  }

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: {
        kind: "enum",
      },
    },
    "enum",
  );

  // Create a member scope for this enum to hold its values
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();

  const wrappedDescription = wrapDescription(props.description);

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        enum <Name />
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
        {" {"}
        <MemberScope value={memberScope}>
          <Indent hardline>
            <ContentSlot>
              <List hardline>{props.children}</List>
            </ContentSlot>
          </Indent>
        </MemberScope>
        <hardline />
        {"}"}
      </CoreDeclaration>
    </>
  );
}
