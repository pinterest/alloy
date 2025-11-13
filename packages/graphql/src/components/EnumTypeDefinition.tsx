import {
  Children,
  Declaration as CoreDeclaration,
  Indent,
  List,
  MemberScope,
  Name,
  Show,
  createContentSlot,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { GraphQLMemberScope, useGraphQLScope } from "../symbols/index.js";
import { BaseDeclarationProps } from "./common-props.js";

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
 *   description='"""User status"""'
 * >
 *   <EnumValue name="ACTIVE" description='"""Currently active"""' />
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

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "enum",
  );

  // Create a member scope for this enum to hold its values
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
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
