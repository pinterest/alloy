import {
  Children,
  Declaration as CoreDeclaration,
  List,
  MemberScope,
  Name,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { GraphQLMemberScope } from "../symbols/graphql-member-scope.js";
import { useGraphQLScope } from "../symbols/scopes.js";
import { Directives } from "./Directives.js";
import { wrapDescription } from "./utils.js";
import { TypedBaseDeclarationProps } from "./common-props.js";

export interface FieldDefinitionProps extends TypedBaseDeclarationProps {
  /**
   * Field arguments (InputValueDefinition components)
   */
  args?: Children;
}

/**
 * A field definition for GraphQL object types and interfaces.
 *
 * @remarks
 * Directives used on fields are automatically validated to ensure they can be used
 * on `FIELD_DEFINITION` location. Invalid directive usage will throw an error during
 * code generation.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const userRef = refkey();
 *
 * <FieldDefinition
 *   name="user"
 *   type={code`${userRef}!`}
 *   description="The user who created this post"
 *   args={
 *     <>
 *       <InputValueDefinition name="id" type={code`${builtInScalars.ID}!`} />
 *       <InputValueDefinition name="includeDeleted" type={builtInScalars.Boolean} defaultValue={false} />
 *     </>
 *   }
 *   directives={
 *     <Directive
 *       name={builtInDirectives.deprecated}
 *       args={{ reason: "Use author instead" }}
 *     />
 *   }
 * />
 * ```
 * renders to
 * ```graphql
 * """
 * The user who created this post
 * """
 * user(id: ID!, includeDeleted: Boolean = false): User! @deprecated(reason: "Use author instead")
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

  const wrappedDescription = wrapDescription(props.description);

  const fieldType = memo(() => <TypeSymbolSlot>{props.type}</TypeSymbolSlot>);

  const hasArgs = Boolean(props.args);

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
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
        <Show when={Boolean(props.directives)}>
          <Directives location="FIELD_DEFINITION">
            {props.directives}
          </Directives>
        </Show>
      </CoreDeclaration>
    </>
  );
}
