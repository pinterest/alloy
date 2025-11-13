import {
  Declaration as CoreDeclaration,
  Name,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { TypedBaseDeclarationProps } from "./common-props.js";
import { ValueExpression } from "./ValueExpression.js";

export interface InputFieldDeclarationProps extends TypedBaseDeclarationProps {
  /**
   * Default value for the input field
   */
  defaultValue?: unknown;
}

/**
 * An input field declaration for GraphQL input object types.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * <>
 *   <InputFieldDeclaration name="id" type={code`${builtInScalars.ID}!`} />
 *   <InputFieldDeclaration
 *     name="name"
 *     type={builtInScalars.String}
 *     description='"""User full name"""'
 *   />
 *   <InputFieldDeclaration
 *     name="limit"
 *     type={builtInScalars.Int}
 *     defaultValue={10}
 *   />
 *   <InputFieldDeclaration
 *     name="tags"
 *     type={code`[${builtInScalars.String}!]!`}
 *     defaultValue={["tag1", "tag2"]}
 *   />
 *   <InputFieldDeclaration
 *     name="oldField"
 *     type={builtInScalars.String}
 *     directives={
 *       <Directive
 *         name={builtInDirectives.deprecated}
 *         args={{ reason: "Use newField instead" }}
 *       />
 *     }
 *   />
 * </>
 *
 * // Enum default values (use refkeys in code templates)
 * const statusRef = refkey();
 * const activeRef = refkey();
 *
 * <>
 *   <EnumTypeDefinition name="Status" refkey={statusRef}>
 *     <EnumValue name="ACTIVE" refkey={activeRef} />
 *     <EnumValue name="INACTIVE" />
 *   </EnumTypeDefinition>
 *   <InputObjectTypeDefinition name="UserInput">
 *     <InputFieldDeclaration
 *       name="status"
 *       type={code`${statusRef}`}
 *       defaultValue={code`${activeRef}`}
 *     />
 *   </InputObjectTypeDefinition>
 * </>
 * ```
 * renders to
 * ```graphql
 * id: ID!
 * """User full name"""
 * name: String
 * limit: Int = 10
 * tags: [String!]! = ["tag1", "tag2"]
 * oldField: String \@deprecated(reason: "Use newField instead")
 *
 * enum Status {
 *   ACTIVE
 *   INACTIVE
 * }
 *
 * input UserInput {
 *   status: Status = ACTIVE
 * }
 * ```
 */
export function InputFieldDeclaration(props: InputFieldDeclarationProps) {
  const TypeSymbolSlot = createSymbolSlot();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "field",
  );

  const typeAnnotation = memo(() => (
    <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
  ));

  const hasDefaultValue = props.defaultValue !== undefined;

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        <Name />: {typeAnnotation}
        <Show when={hasDefaultValue}>
          {" = "}
          <ValueExpression jsValue={props.defaultValue} />
        </Show>
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}
