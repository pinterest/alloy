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
import { NamedDeclarationProps } from "./common-props.js";

export interface EnumTypeExtensionProps extends NamedDeclarationProps {
  /**
   * Additional enum values (EnumValue components)
   */
  children?: Children;
  /**
   * Directives to add to the enum
   */
  directives?: Children;
}

/**
 * An enum type extension for GraphQL schemas.
 * Extends an existing enum type with additional values or directives.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <>
 *   <EnumTypeExtension name="Status">
 *     <EnumValue name="ARCHIVED" description='"""Archived status"""' />
 *     <EnumValue name="SUSPENDED" />
 *   </EnumTypeExtension>
 *   <EnumTypeExtension
 *     name="Role"
 *     directives={<Directive name={builtInDirectives.deprecated} />}
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * extend enum Status {
 *   """
 *   Archived status
 *   """
 *   ARCHIVED
 *   SUSPENDED
 * }
 * extend enum Role \@deprecated
 * ```
 */
export function EnumTypeExtension(props: EnumTypeExtensionProps) {
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "enum",
  );

  // Create a member scope for the extended values
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();
  const hasBody = Boolean(props.children);

  return (
    <CoreDeclaration symbol={sym}>
      extend enum <Name />
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
      <Show when={hasBody}>
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
      </Show>
    </CoreDeclaration>
  );
}
