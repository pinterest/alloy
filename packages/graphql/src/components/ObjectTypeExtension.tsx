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

export interface ObjectTypeExtensionProps extends NamedDeclarationProps {
  /**
   * Additional fields to add to the object type (FieldDefinition components)
   */
  children?: Children;
  /**
   * Additional interfaces this type should implement
   */
  implements?: Children[];
  /**
   * Directives to add to the type
   */
  directives?: Children;
}

/**
 * An object type extension for GraphQL schemas.
 * Extends an existing object type with additional fields, interfaces, or directives.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const timestampedRef = refkey();
 *
 * <ObjectTypeExtension
 *   name="User"
 *   implements={[timestampedRef]}
 *   directives={<Directive name="key" args={{ fields: "id" }} />}
 * >
 *   <FieldDefinition name="createdAt" type={<TypeReference type={builtInScalars.String} required />} />
 *   <FieldDefinition name="updatedAt" type={<TypeReference type={builtInScalars.String} required />} />
 * </ObjectTypeExtension>
 * ```
 * renders to
 * ```graphql
 * extend type User implements Timestamped @key(fields: "id") {
 *   createdAt: String!
 *   updatedAt: String!
 * }
 * ```
 */
export function ObjectTypeExtension(props: ObjectTypeExtensionProps) {
  // Get parent scope for establishing member scope hierarchy
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    { refkeys: props.refkey },
    "object",
  );

  // Create a member scope for the extended fields
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();
  const hasBody = Boolean(props.children);

  return (
    <CoreDeclaration symbol={sym}>
      extend type <Name />
      <Show when={Boolean(props.implements && props.implements.length)}>
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
