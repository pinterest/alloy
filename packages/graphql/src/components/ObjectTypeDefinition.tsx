import {
  Children,
  Declaration as CoreDeclaration,
  Indent,
  List,
  MemberScope,
  Name,
  Refkey,
  Show,
  createContentSlot,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { GraphQLMemberScope, useGraphQLScope } from "../symbols/index.js";

export interface ObjectTypeDefinitionProps {
  /**
   * The name of the object type
   */
  name: string;
  /**
   * Fields of the object type (FieldDefinition components)
   */
  children?: Children;
  /**
   * Description for the type
   */
  description?: Children;
  /**
   * Interfaces this type implements
   */
  implements?: Children[];
  /**
   * Directives to apply to the type
   */
  directives?: Children;
  /**
   * Reference key for this type symbol
   */
  refkey?: Refkey;
}

/**
 * An object type definition for GraphQL schemas.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const nodeRef = refkey();
 * const timestampedRef = refkey();
 * const userRef = refkey();
 *
 * <ObjectTypeDefinition
 *   name="User"
 *   refkey={userRef}
 *   description='"""A user in the system"""'
 *   implements={[nodeRef, timestampedRef]}
 *   directives={<Directive name="auth" args={{ requires: "ADMIN" }} />}
 * >
 *   <FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
 *   <FieldDefinition name="name" type={code`${builtInScalars.String}!`} />
 *   <FieldDefinition name="email" type={builtInScalars.String} />
 * </ObjectTypeDefinition>
 * ```
 * renders to
 * ```graphql
 * """
 * A user in the system
 * """
 * type User implements Node Timestamped @auth(requires: "ADMIN") {
 *   id: ID!
 *   name: String!
 *   email: String
 * }
 * ```
 */
export function ObjectTypeDefinition(props: ObjectTypeDefinitionProps) {
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "type",
  );

  // Create a member scope for this object type to hold its fields
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();

  const implementsPart = props.implements && props.implements.length > 0 && (
    <>
      {" "}
      implements <List children={props.implements} comma={false} space />
    </>
  );

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        type <Name />
        {implementsPart}
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
