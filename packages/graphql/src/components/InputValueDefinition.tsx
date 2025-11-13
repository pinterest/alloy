import {
  Children,
  Declaration as CoreDeclaration,
  Name,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { TypedBaseDeclarationProps } from "./common-props.js";
import { Directives } from "./Directives.js";
import {
  validateInputType,
  validateNonNullDefault,
  wrapDescription,
} from "./utils.js";
import { ValueExpression } from "./ValueExpression.js";

export interface InputValueDefinitionProps extends TypedBaseDeclarationProps {
  /**
   * Default value for the argument
   */
  defaultValue?: Children;
}

/**
 * An input value definition for GraphQL field arguments and directive arguments.
 *
 * @example
 * ```tsx
 * <>
 *   <InputValueDefinition name="id" type={code`${builtInScalars.ID}!`} />
 *   <InputValueDefinition name="limit" type={builtInScalars.Int} defaultValue={10} />
 *   <InputValueDefinition
 *     name="reason"
 *     type={builtInScalars.String}
 *     defaultValue="Not specified"
 *     description='"""Reason for the action"""'
 *   />
 *   <InputValueDefinition
 *     name="priority"
 *     type={builtInScalars.Int}
 *     directives={<Directive name={builtInDirectives.deprecated} />}
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
 *   <InputValueDefinition
 *     name="status"
 *     type={code`${statusRef}`}
 *     defaultValue={code`${activeRef}`}
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * id: ID!
 * limit: Int = 10
 * """Reason for the action"""
 * reason: String = "Not specified"
 * priority: Int \@deprecated
 *
 * enum Status {
 *   ACTIVE
 *   INACTIVE
 * }
 * status: Status = ACTIVE
 * ```
 */
export function InputValueDefinition(props: InputValueDefinitionProps) {
  const TypeSymbolSlot = createSymbolSlot();

  // Validate that the argument type is valid for input positions
  validateInputType(props.type, props.name, "Argument");

  // Validate that non-null types don't have null default values
  if (props.defaultValue !== undefined) {
    validateNonNullDefault(
      props.type,
      props.defaultValue,
      props.name,
      "Argument",
    );
  }

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: {
        type: props.type,
      },
    },
    "argument",
  );

  const wrappedDescription = wrapDescription(props.description);

  const inputType = memo(() => <TypeSymbolSlot>{props.type}</TypeSymbolSlot>);

  const hasDefaultValue = props.defaultValue !== undefined;

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        <Name />: {inputType}
        <Show when={hasDefaultValue}>
          {" = "}
          <ValueExpression jsValue={props.defaultValue} />
        </Show>
        <Show when={Boolean(props.directives)}>
          <Directives location="ARGUMENT_DEFINITION">
            {props.directives}
          </Directives>
        </Show>
      </CoreDeclaration>
    </>
  );
}
