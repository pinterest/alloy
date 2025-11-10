import {
  Children,
  Declaration as CoreDeclaration,
  Name,
  Refkey,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { Directives } from "./Directives.js";
import { validateNonNullDefault, wrapDescription } from "./utils.js";
import { ValueExpression } from "./ValueExpression.js";

export interface InputValueDefinitionProps {
  /**
   * The name of the argument
   */
  name: string;
  /**
   * The type of the argument. Type modifiers like non-null (!) should be included.
   *
   * Can be:
   * - A string literal: `"String"`, `"ID!"`, `"Int"`
   * - A built-in scalar: `builtInScalars.String`
   * - A refkey to a user-defined type
   * - A code template for composition: code`[${inputTypeRef}]!`
   */
  type: Children;
  /**
   * Default value for the argument
   */
  defaultValue?: Children;
  /**
   * Description for the argument. Will be automatically wrapped in triple quotes (""").
   */
  description?: Children;
  /**
   * Directives to apply to the argument
   */
  directives?: Children;
  /**
   * Reference key for this argument symbol
   */
  refkey?: Refkey;
  /**
   * Whether the default value is an enum value (renders without quotes)
   */
  enumDefault?: boolean;
}

/**
 * An input value definition for GraphQL field arguments and directive arguments.
 *
 * @example
 * ```tsx
 * <InputValueDefinition
 *   name="reason"
 *   type={builtInScalars.String}
 *   defaultValue="Not specified"
 *   description="Reason for the action"
 *   directives={<Directive name={builtInDirectives.deprecated} />}
 * />
 * ```
 * renders to
 * ```graphql
 * """
 * Reason for the action
 * """
 * reason: String = "Not specified" @deprecated
 * ```
 */
export function InputValueDefinition(props: InputValueDefinitionProps) {
  const TypeSymbolSlot = createSymbolSlot();

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
          <Show
            when={props.enumDefault}
            fallback={<ValueExpression jsValue={props.defaultValue} />}
          >
            {props.defaultValue}
          </Show>
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
