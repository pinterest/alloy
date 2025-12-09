import {
  Declaration as CoreDeclaration,
  Name,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { TypedBaseDeclarationProps } from "./common-props.js";
import {
  useOneOfInputContext,
  validateOneOfFieldNoDefault,
  validateOneOfFieldNullable,
} from "./OneOfInputValidation.js";
import {
  validateInputType,
  validateTypeReference,
  wrapDescription,
} from "./utils.js";
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
 * import { refkey } from "@alloy-js/core";
 *
 * <>
 *   <InputFieldDeclaration name="id" type={<TypeReference type={builtInScalars.ID} required />} />
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
 *     type={<TypeReference type={<TypeReference type={builtInScalars.String} required />} list required />}
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
 * // Enum default values (use refkeys)
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
 *       type={statusRef}
 *       defaultValue={activeRef}
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
  const isInOneOfInput = useOneOfInputContext();

  // Validate that type is a TypeReference component
  validateTypeReference(props.type, props.name, "Input field");

  // Validate that the field type is valid for input positions
  validateInputType(props.type, props.name, "Input field");

  // Validate @oneOf constraints if we're inside a @oneOf input object
  if (isInOneOfInput) {
    validateOneOfFieldNullable(props.type, props.name);
    validateOneOfFieldNoDefault(props.defaultValue, props.name);
  }

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

  const wrappedDescription = wrapDescription(props.description);
  const hasDefaultValue = props.defaultValue !== undefined;

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
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
