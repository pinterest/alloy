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
import { wrapDescription } from "./utils.js";

/**
 * Valid directive locations in GraphQL
 * @see https://spec.graphql.org/September2025/#DirectiveLocation
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
   * The name of the directive (without the @ symbol)
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
   * Description for the directive. Will be automatically wrapped in triple quotes (""").
   */
  description?: Children;
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
 * @remarks
 * This component validates that:
 * - At least one location is specified
 * - All locations are valid GraphQL directive locations
 * - The directive name is not already defined in the current scope
 *
 * @example
 * ```tsx
 * <DirectiveDefinition
 *   name="auth"
 *   repeatable
 *   description="Authorization directive for fields and types.\nRequires specific roles or scopes."
 *   locations={["FIELD_DEFINITION", "OBJECT"]}
 *   args={
 *     <>
 *       <InputValueDefinition name="requires" type="Role!" defaultValue="USER" enumDefault />
 *       <InputValueDefinition name="scopes" type={code`[${builtInScalars.String}!]`} />
 *     </>
 *   }
 * />
 * ```
 * renders to
 * ```graphql
 * """
 * Authorization directive for fields and types.
 * """
 * directive @auth(
 *   requires: Role! = USER
 *   scopes: [String!]
 * ) repeatable on FIELD_DEFINITION | OBJECT
 * ```
 *
 * @throws {Error} If locations array is empty
 * @throws {Error} If directive name is already defined
 */
export function DirectiveDefinition(props: DirectiveDefinitionProps) {
  const scope = useGraphQLScope();

  // Validate locations
  if (!props.locations || props.locations.length === 0) {
    throw new Error(
      `Directive @${props.name} must specify at least one location`,
    );
  }

  // Check for duplicate directive definitions
  if (scope && "symbols" in scope) {
    const existingSymbol = scope.symbols.symbolNames.get(props.name);
    if (existingSymbol) {
      throw new Error(
        `Directive @${props.name} is already defined in this scope`,
      );
    }
  }

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: {
        locations: props.locations,
        repeatable: props.repeatable ?? false,
        // Store a reference to the argument scope for later validation
        hasArguments: Boolean(props.args),
      },
    },
    "directive",
  );

  // Create a member scope for directive arguments
  const argScope = new GraphQLMemberScope(`${props.name}.args`, scope, {
    ownerSymbol: sym,
  });

  const wrappedDescription = wrapDescription(props.description);

  const hasArgs = Boolean(props.args);

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
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
