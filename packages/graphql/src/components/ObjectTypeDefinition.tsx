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
import { Directives } from "./Directives.js";
import { ImplementsInterfaces } from "./ImplementsInterfaces.js";
import { wrapDescription } from "./utils.js";

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
   * Description for the type. Will be automatically wrapped in triple quotes (""").
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
 * When a type implements interfaces, and those interfaces themselves implement other interfaces,
 * the rendered output will automatically include all transitive interfaces. For example, if
 * interface B implements interface C, and type A implements B, the output will be
 * `type A implements B & C { ... }` even though you only specified `implements={[B]}`.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const nodeRef = refkey();
 * const timestampedRef = refkey();
 *
 * <ObjectTypeDefinition
 *   name="User"
 *   description="A user in the system.\nCan create posts and interact with other users."
 *   implements={[nodeRef, timestampedRef]}
 *   directives={<Directive name="auth" args={{ requires: "ADMIN" }} />}
 * >
 *   <FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
 *   <FieldDefinition name="email" type={builtInScalars.String} />
 * </ObjectTypeDefinition>
 * ```
 * renders to
 * ```graphql
 * """
 * A user in the system.
 * Can create posts and interact with other users.
 * """
 * type User implements Node & Timestamped @auth(requires: "ADMIN") {
 *   id: ID!
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
      metadata: {
        implements: props.implements ?? [],
      },
    },
    "type",
  );

  // Create a member scope for this object type to hold its fields
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
        type <Name />
        <Show when={props.implements && props.implements.length > 0}>
          <ImplementsInterfaces interfaces={props.implements!} />
        </Show>
        <Show when={Boolean(props.directives)}>
          <Directives location="OBJECT">{props.directives}</Directives>
        </Show>
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
