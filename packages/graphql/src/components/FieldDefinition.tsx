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
import { TypedBaseDeclarationProps } from "./common-props.js";
import { Directives } from "./Directives.js";
import {
  validateOutputType,
  validateTypeReference,
  wrapDescription,
} from "./utils.js";

export interface FieldDefinitionProps extends TypedBaseDeclarationProps {
  /**
   * Field arguments (InputValueDefinition components)
   */
  args?: Children;
}

/**
 * A field definition for GraphQL object types and interfaces.
 * For input object fields, use InputFieldDeclaration instead.
 *
 * @remarks
 * Directives used on fields are automatically validated to ensure they can be used
 * on `FIELD_DEFINITION` location. Invalid directive usage will throw an error during
 * code generation.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const userRef = refkey();
 *
 * <>
 *   <FieldDefinition name="id" type={<TypeReference type={builtInScalars.ID} required />} />
 *   <FieldDefinition
 *     name="name"
 *     type={<TypeReference type={builtInScalars.String} />}
 *     description='"""User full name"""'
 *   />
 *   <FieldDefinition name="tags" type={<TypeReference type={<TypeReference type={builtInScalars.String} required />} list required />} />
 *   <FieldDefinition
 *     name="user"
 *     type={<TypeReference type={userRef} required />}
 *     args={
 *       <>
 *         <InputValueDefinition name="id" type={<TypeReference type={builtInScalars.ID} required />} />
 *         <InputValueDefinition name="includeDeleted" type={<TypeReference type={builtInScalars.Boolean} />} defaultValue={false} />
 *       </>
 *     }
 *   />
 *   <FieldDefinition
 *     name="legacyField"
 *     type={<TypeReference type={builtInScalars.String} />}
 *     directives={
 *       <Directive
 *         name={builtInDirectives.deprecated}
 *         args={{ reason: "Use newField instead" }}
 *       />
 *     }
 *   />
 * </>
 *
 * // Field with enum default value in arguments
 * const statusRef = refkey();
 * const activeRef = refkey();
 *
 * <>
 *   <EnumTypeDefinition name="Status" refkey={statusRef}>
 *     <EnumValue name="ACTIVE" refkey={activeRef} />
 *     <EnumValue name="INACTIVE" />
 *   </EnumTypeDefinition>
 *   <ObjectTypeDefinition name="Query">
 *     <FieldDefinition
 *       name="users"
 *       type={<TypeReference type={<TypeReference type="User" required />} list required />}
 *       args={
 *         <InputValueDefinition
 *           name="status"
 *           type={<TypeReference type={statusRef} />}
 *           defaultValue={activeRef}
 *         />
 *       }
 *     />
 *   </ObjectTypeDefinition>
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
 *
 * enum Status {
 *   ACTIVE
 *   INACTIVE
 * }
 *
 * type Query {
 *   users(status: Status = ACTIVE): [User!]!
 * }
 * ```
 */
export function FieldDefinition(props: FieldDefinitionProps) {
  const TypeSymbolSlot = createSymbolSlot();
  const scope = useGraphQLScope();

  // Validate that type is a TypeReference component
  validateTypeReference(props.type, props.name, "Field");

  // Validate that the field type is valid for output positions
  validateOutputType(props.type, props.name, "type");

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: {
        typeAnnotation: props.type,
      },
    },
    "field",
  );

  // Create a member scope for field arguments
  // Arguments will be stored in sym.members when rendered
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
