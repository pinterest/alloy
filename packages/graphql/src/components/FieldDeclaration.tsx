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

export interface FieldDeclarationProps {
  /**
   * The name of the field
   */
  name: string;
  /**
   * Reference key for this field symbol
   */
  refkey?: Refkey;
  /**
   * Documentation for the field
   */
  doc?: Children;
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
   * Field arguments (ArgumentDeclaration components)
   */
  args?: Children;
  /**
   * Directives to apply to the field
   */
  directives?: Children;
}

/**
 * A field declaration for GraphQL object types, interfaces, and input types.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const userRef = refkey();
 *
 * <>
 *   <FieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
 *   <FieldDeclaration
 *     name="name"
 *     type={builtInScalars.String}
 *     doc='"""User full name"""'
 *   />
 *   <FieldDeclaration name="tags" type={code`[${builtInScalars.String}!]!`} />
 *   <FieldDeclaration
 *     name="user"
 *     type={code`${userRef}!`}
 *     args={
 *       <>
 *         <ArgumentDeclaration name="id" type={code`${builtInScalars.ID}!`} />
 *         <ArgumentDeclaration name="includeDeleted" type={builtInScalars.Boolean} default={false} />
 *       </>
 *     }
 *   />
 *   <FieldDeclaration
 *     name="legacyField"
 *     type={builtInScalars.String}
 *     directives={
 *       <DirectiveApplication
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
 * legacyField: String @deprecated(reason: "Use newField instead")
 * ```
 */
export function FieldDeclaration(props: FieldDeclarationProps) {
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

  const typeAnnotation = memo(() => (
    <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
  ));

  const hasArgs = Boolean(props.args);

  return (
    <>
      <Show when={Boolean(props.doc)}>
        {props.doc}
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
        : {typeAnnotation}
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}
