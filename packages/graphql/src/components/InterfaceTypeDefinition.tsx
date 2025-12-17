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
import { ImplementsInterfaces } from "./ImplementsInterfaces.js";
import { wrapDescription } from "./utils.js";

export interface InterfaceTypeDefinitionProps extends BaseDeclarationProps {
  /**
   * Fields of the interface (FieldDefinition components)
   */
  children?: Children;
  /**
   * Interfaces this interface implements
   */
  implements?: Children[];
}

/**
 * An interface type definition for GraphQL schemas.
 * Interfaces define a set of fields that object types can implement.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const nodeRef = refkey();
 * const timestampedRef = refkey();
 *
 * <InterfaceTypeDefinition
 *   name="Node"
 *   refkey={nodeRef}
 *   description='"""An object with a unique identifier"""'
 * >
 *   <FieldDefinition name="id" type={<TypeReference type={builtInScalars.ID} required />} />
 * </InterfaceTypeDefinition>
 *
 * <InterfaceTypeDefinition
 *   name="Timestamped"
 *   refkey={timestampedRef}
 *   implements={[nodeRef]}
 *   description='"""An object with creation and update timestamps"""'
 * >
 *   <FieldDefinition name="id" type={<TypeReference type={builtInScalars.ID} required />} />
 *   <FieldDefinition name="createdAt" type={<TypeReference type={builtInScalars.String} required />} />
 *   <FieldDefinition name="updatedAt" type={<TypeReference type={builtInScalars.String} required />} />
 * </InterfaceTypeDefinition>
 * ```
 * renders to
 * ```graphql
 * """
 * An object with a unique identifier
 * """
 * interface Node {
 *   id: ID!
 * }
 *
 * """
 * An object with creation and update timestamps
 * """
 * interface Timestamped implements Node {
 *   id: ID!
 *   createdAt: String!
 *   updatedAt: String!
 * }
 * ```
 */
export function InterfaceTypeDefinition(props: InterfaceTypeDefinitionProps) {
  // Get parent scope for establishing member scope hierarchy
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: { implements: props.implements ?? [] },
    },
    "interface",
  );

  // Create a member scope for this interface to hold its fields
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
        interface <Name />
        <Show when={Boolean(props.implements && props.implements.length)}>
          <ImplementsInterfaces interfaces={props.implements!} />
        </Show>
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
