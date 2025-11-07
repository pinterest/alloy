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

export interface ArgumentDeclarationProps {
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
   * Default value for the argument (rendered as a GraphQL value literal).
   * Numbers, booleans, arrays, and objects are rendered as expected.
   * Strings are quoted unless `enumDefault` is true.
   */
  default?: unknown;
  /**
   * When true, treats the `default` value as an unquoted enum value.
   * Only applies when `default` is a string.
   */
  enumDefault?: boolean;
  /**
   * Documentation for the argument
   */
  doc?: Children;
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
 * An argument declaration for GraphQL fields and directives.
 *
 * @example
 * ```tsx
 * <>
 *   <ArgumentDeclaration name="id" type={code`${builtInScalars.ID}!`} />
 *   <ArgumentDeclaration name="limit" type={builtInScalars.Int} default={10} />
 *   <ArgumentDeclaration
 *     name="reason"
 *     type={builtInScalars.String}
 *     default="Not specified"
 *     doc='"""Reason for the action"""'
 *   />
 *   <ArgumentDeclaration
 *     name="status"
 *     type="Status!"
 *     default="ACTIVE"
 *     enumDefault
 *   />
 *   <ArgumentDeclaration
 *     name="priority"
 *     type={builtInScalars.Int}
 *     directives={<DirectiveApplication name={builtInDirectives.deprecated} />}
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * id: ID!
 * limit: Int = 10
 * """Reason for the action"""
 * reason: String = "Not specified"
 * status: Status! = ACTIVE
 * priority: Int @deprecated
 * ```
 */
export function ArgumentDeclaration(props: ArgumentDeclarationProps) {
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

  const hasDefaultValue = props.default !== undefined;

  return (
    <>
      <Show when={Boolean(props.doc)}>
        {props.doc}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        <Name />: {typeAnnotation}
        <Show when={hasDefaultValue}>
          {" = "}
          <ValueExpression jsValue={props.default} enum={props.enumDefault} />
        </Show>
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
      </CoreDeclaration>
    </>
  );
}
