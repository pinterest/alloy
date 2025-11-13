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
import { ImplementsInterfaces } from "./ImplementsInterfaces.js";

export interface InterfaceTypeExtensionProps extends NamedDeclarationProps {
  /**
   * Additional fields to add to the interface (FieldDefinition components)
   */
  children?: Children;
  /**
   * Additional interfaces this interface should implement
   */
  implements?: Children[];
  /**
   * Directives to add to the interface
   */
  directives?: Children;
}

/**
 * An interface type extension for GraphQL schemas.
 * Extends an existing interface type with additional fields, interfaces, or directives.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const nodeRef = refkey();
 *
 * <InterfaceTypeExtension
 *   name="Timestamped"
 *   implements={[nodeRef]}
 * >
 *   <FieldDefinition name="deletedAt" type={builtInScalars.String} />
 * </InterfaceTypeExtension>
 * ```
 * renders to
 * ```graphql
 * extend interface Timestamped implements Node {
 *   deletedAt: String
 * }
 * ```
 */
export function InterfaceTypeExtension(props: InterfaceTypeExtensionProps) {
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "type",
  );

  // Create a member scope for the extended fields
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();
  const hasBody = Boolean(props.children);

  return (
    <CoreDeclaration symbol={sym}>
      extend interface <Name />
      <Show when={props.implements && props.implements.length > 0}>
        <ImplementsInterfaces interfaces={props.implements!} />
      </Show>
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
