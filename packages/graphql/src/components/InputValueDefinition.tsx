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
   * Description for the argument
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
 * ```
 * renders to
 * ```graphql
 * id: ID!
 * limit: Int = 10
 * """Reason for the action"""
 * reason: String = "Not specified"
 * priority: Int \@deprecated
 * ```
 */
export function InputValueDefinition(props: InputValueDefinitionProps) {
  const TypeSymbolSlot = createSymbolSlot();

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "argument",
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
