import {
  Children,
  Declaration as CoreDeclaration,
  Indent,
  List,
  Name,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { NamedDeclarationProps } from "./common-props.js";

export interface FragmentDefinitionProps extends NamedDeclarationProps {
  /**
   * The type condition (the type this fragment applies to)
   */
  typeCondition: Children;
  /**
   * Directives to apply to the fragment
   */
  directives?: Children;
  /**
   * Field selections in the fragment
   */
  children?: Children;
}

/**
 * A fragment definition in a GraphQL operation.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const userFragmentRef = refkey();
 *
 * <FragmentDefinition
 *   name="UserFields"
 *   refkey={userFragmentRef}
 *   typeCondition="User"
 * >
 *   <FieldSelection name="id" />
 *   <FieldSelection name="name" />
 *   <FieldSelection name="email" />
 * </FragmentDefinition>
 * ```
 * renders to
 * ```graphql
 * fragment UserFields on User {
 *   id
 *   name
 *   email
 * }
 * ```
 */
export function FragmentDefinition(props: FragmentDefinitionProps) {
  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "fragment",
  );

  return (
    <CoreDeclaration symbol={sym}>
      fragment <Name /> on {props.typeCondition}
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
      {" {"}
      <Indent hardline>
        <List children={props.children} joiner={<hardline />} />
      </Indent>
      <hardline />
      {"}"}
    </CoreDeclaration>
  );
}
