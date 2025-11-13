import {
  Children,
  Declaration as CoreDeclaration,
  List,
  MemberScope,
  Name,
  Refkey,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { GraphQLMemberScope } from "../symbols/graphql-member-scope.js";
import { useGraphQLScope } from "../symbols/scopes.js";

/**
 * Valid directive locations in GraphQL
 * @see https://spec.graphql.org/October2021/#DirectiveLocation
 */
export type DirectiveLocation =
  // Executable directive locations
  | "QUERY"
  | "MUTATION"
  | "SUBSCRIPTION"
  | "FIELD"
  | "FRAGMENT_DEFINITION"
  | "FRAGMENT_SPREAD"
  | "INLINE_FRAGMENT"
  | "VARIABLE_DEFINITION"
  // Type system directive locations
  | "SCHEMA"
  | "SCALAR"
  | "OBJECT"
  | "FIELD_DEFINITION"
  | "ARGUMENT_DEFINITION"
  | "INTERFACE"
  | "UNION"
  | "ENUM"
  | "ENUM_VALUE"
  | "INPUT_OBJECT"
  | "INPUT_FIELD_DEFINITION";

export interface DirectiveDefinitionProps {
  /**
   * The name of the directive (without the \@ symbol)
   */
  name: string;
  /**
   * Valid locations where this directive can be applied
   */
  locations: DirectiveLocation[];
  /**
   * Arguments for the directive (InputValueDefinition components)
   */
  args?: Children;
  /**
   * Documentation for the directive
   */
  doc?: Children;
  /**
   * Whether the directive can be applied multiple times to the same location
   */
  repeatable?: boolean;
  /**
   * Reference key for this directive symbol
   */
  refkey?: Refkey;
}

/**
 * Defines a custom GraphQL directive in the schema.
 *
 * @example
 * ```tsx
 * <DirectiveDefinition
 *   name="auth"
 *   doc='"""Authorization directive for fields and types"""'
 *   repeatable
 *   locations={["FIELD_DEFINITION", "OBJECT"]}
 *   args={
 *     <>
 *       <InputValueDefinition name="requires" type="Role!" default="USER" enumDefault />
 *       <InputValueDefinition name="scopes" type={code`[${builtInScalars.String}!]`} />
 *     </>
 *   }
 * />
 * ```
 * renders to
 * ```graphql
 * """
 * Authorization directive for fields and types
 * """
 * directive @auth(
 *   requires: Role! = USER
 *   scopes: [String!]
 * ) repeatable on FIELD_DEFINITION | OBJECT
 * ```
 */
export function DirectiveDefinition(props: DirectiveDefinitionProps) {
  const scope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "directive",
  );

  // Create a member scope for directive arguments
  const argScope = new GraphQLMemberScope(`${props.name}.args`, scope, {
    ownerSymbol: sym,
  });

  const hasArgs = Boolean(props.args);

  return (
    <>
      <Show when={Boolean(props.doc)}>
        {props.doc}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        directive @<Name />
        <Show when={hasArgs}>
          (
          <MemberScope value={argScope}>
            <List comma space>
              {props.args}
            </List>
          </MemberScope>
          )
        </Show>
        <Show when={props.repeatable}> repeatable</Show>
        {" on "}
        {props.locations.join(" | ")}
      </CoreDeclaration>
    </>
  );
}
