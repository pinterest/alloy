import {
  Children,
  Declaration as CoreDeclaration,
  List,
  MemberScope,
  Name,
  Refkey,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { GraphQLMemberScope } from "../symbols/graphql-member-scope.js";
import { useGraphQLScope } from "../symbols/scopes.js";

export interface FieldDefinitionProps {
  /**
   * The name of the field
   */
  name: string;
  /**
   * Reference key for this field symbol
   */
  refkey?: Refkey;
  /**
   * Description for the field
   */
  description?: Children;
  /**
   * The type of the field. Type modifiers like non-null (!) and list ([])
   * should be included in the type string itself.
   *
   * Aimed to be able to support:
   * - A string literal: `"String"`, `"ID!"`, `"[String!]!"`
   * - A built-in scalar: `builtInScalars.String` (which is `"String"`)
   * - A refkey to a user-defined type
   * - A code template for composition: code`[${userTypeRef}]!`
   */
  type: Children;
  /**
   * Field arguments (InputValueDefinition components)
   */
  args?: Children;
  /**
   * Directives to apply to the field
   */
  directives?: Children;
}

/**
 * A field definition for GraphQL object types and interfaces.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const userRef = refkey();
 *
 * <>
 *   <FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
 *   <FieldDefinition
 *     name="name"
 *     type={builtInScalars.String}
 *     description='"""User full name"""'
 *   />
 *   <FieldDefinition name="tags" type={code`[${builtInScalars.String}!]!`} />
 *   <FieldDefinition
 *     name="user"
 *     type={code`${userRef}!`}
 *     args={
 *       <>
 *         <InputValueDefinition name="id" type={code`${builtInScalars.ID}!`} />
 *         <InputValueDefinition name="includeDeleted" type={builtInScalars.Boolean} defaultValue={false} />
 *       </>
 *     }
 *   />
 *   <FieldDefinition
 *     name="legacyField"
 *     type={builtInScalars.String}
 *     directives={
 *       <Directive
 *         name={builtInDirectives.deprecated}
 *         args={{ reason: "Use newField instead" }}
 *       />
 *     }
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * id: ID!
 * """User full name"""
 * name: String
 * tags: [String!]!
 * user(id: ID!, includeDeleted: Boolean = false): User!
 * legacyField: String \@deprecated(reason: "Use newField instead")
 * ```
 */
export function FieldDefinition(props: FieldDefinitionProps) {
  const TypeSymbolSlot = createSymbolSlot();
  const scope = useGraphQLScope();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "field",
  );

  // Create a member scope for field arguments
  const argScope = new GraphQLMemberScope(`${props.name}.args`, scope, {
    ownerSymbol: sym,
  });

  const fieldType = memo(() => <TypeSymbolSlot>{props.type}</TypeSymbolSlot>);

  const hasArgs = Boolean(props.args);

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        <Name />
        <Show when={hasArgs}>
          (
          <MemberScope value={argScope}>
            <List comma space>
              {props.args}
            </List>
          </MemberScope>
          )
        </Show>
        : {fieldType}
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}
