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

export interface InputObjectTypeDefinitionProps extends BaseDeclarationProps {
  /**
   * Input fields of the input object type (InputFieldDeclaration components)
   */
  children?: Children;
}

/**
 * An input object type definition for GraphQL schemas.
 * Input types are used for complex input arguments in queries and mutations.
 *
 * @example
 * ```tsx
 * <>
 *   <InputObjectTypeDefinition
 *     name="FilterInput"
 *     directives={<Directive name="oneOf" />}
 *     description='"""Filter input"""'
 *   >
 *     <InputFieldDeclaration name="nameContains" type={builtInScalars.String} />
 *     <InputFieldDeclaration name="emailEquals" type={builtInScalars.String} />
 *   </InputObjectTypeDefinition>
 * </>
 * ```
 * renders to
 * ```graphql
 * """
 * Filter input
 * """
 * input FilterInput @oneOf {
 *   nameContains: String
 *   emailEquals: String
 * }
 * ```
 */
export function InputObjectTypeDefinition(
  props: InputObjectTypeDefinitionProps,
) {
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "type",
  );

  // Create a member scope for this input type to hold its fields
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
        input <Name />
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
