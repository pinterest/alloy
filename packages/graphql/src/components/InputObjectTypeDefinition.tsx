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
import { OneOfInputProvider } from "./OneOfInputValidation.js";
import { wrapDescription } from "./utils.js";

export interface InputObjectTypeDefinitionProps extends BaseDeclarationProps {
  /**
   * Input fields of the input object type (InputFieldDeclaration components)
   */
  children?: Children;
  /**
   * Whether this is a @oneOf input object.
   * When true, all fields must be nullable and cannot have default values.
   *
   * This must be explicitly set to true when using the @oneOf directive.
   * The component cannot automatically detect the directive due to JSX evaluation timing.
   *
   * @see https://spec.graphql.org/September2025/#sec-OneOf-Input-Objects
   */
  isOneOf?: boolean;
}

/**
 * An input object type definition for GraphQL schemas.
 * Input types are used for complex input arguments in queries and mutations.
 *
 * @example
 * @example
 * ```tsx
 * <>
 *   <InputObjectTypeDefinition
 *     name="FilterInput"
 *     isOneOf
 *     directives={<Directive name="oneOf" />}
 *     description="Filter input"
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
 *
 * @remarks
 * When `isOneOf` is true, the component validates that:
 * - All input fields are nullable (no `!` at the end of the type)
 * - No input fields have default values
 */
export function InputObjectTypeDefinition(
  props: InputObjectTypeDefinitionProps,
) {
  const parentScope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: {
        kind: "input",
      },
    },
    "input",
  );

  // Create a member scope for this input type to hold its fields
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
        input <Name />
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
        {" {"}
        <MemberScope value={memberScope}>
          <Indent hardline>
            <ContentSlot>
              <Show
                when={props.isOneOf}
                fallback={<List hardline>{props.children}</List>}
              >
                <OneOfInputProvider>
                  <List hardline>{props.children}</List>
                </OneOfInputProvider>
              </Show>
            </ContentSlot>
          </Indent>
        </MemberScope>
        <hardline />
        {"}"}
      </CoreDeclaration>
    </>
  );
}
