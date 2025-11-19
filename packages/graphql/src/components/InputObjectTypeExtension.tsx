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

export interface InputObjectTypeExtensionProps extends NamedDeclarationProps {
  /**
   * Additional input fields (InputFieldDeclaration components)
   */
  children?: Children;
  /**
   * Directives to add to the input object type
   */
  directives?: Children;
}

/**
 * An input object type extension for GraphQL schemas.
 * Extends an existing input object type with additional fields or directives.
 *
 * @example
 * ```tsx
 * <>
 *   <InputObjectTypeExtension name="FilterInput">
 *     <InputFieldDeclaration name="createdAfter" type={builtInScalars.String} />
 *     <InputFieldDeclaration name="createdBefore" type={builtInScalars.String} />
 *   </InputObjectTypeExtension>
 *   <InputObjectTypeExtension
 *     name="UserInput"
 *     directives={<Directive name="deprecated" />}
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * extend input FilterInput {
 *   createdAfter: String
 *   createdBefore: String
 * }
 * extend input UserInput \@deprecated
 * ```
 */
export function InputObjectTypeExtension(props: InputObjectTypeExtensionProps) {
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "input",
  );

  // Create a member scope for the extended fields
  const memberScope = new GraphQLMemberScope(props.name, parentScope, {
    ownerSymbol: sym,
  });

  const ContentSlot = createContentSlot();
  const hasBody = Boolean(props.children);

  return (
    <CoreDeclaration symbol={sym}>
      extend input <Name />
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
