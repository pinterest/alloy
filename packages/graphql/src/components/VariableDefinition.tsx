import {
  Children,
  Declaration as CoreDeclaration,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { ValueExpression } from "./ValueExpression.js";
import { validateInputType, validateNonNullDefault } from "./utils.js";

export interface VariableDefinitionProps {
  /**
   * The name of the variable (without the $ prefix)
   */
  name: string;
  /**
   * The type of the variable
   */
  type: Children;
  /**
   * Default value for the variable
   */
  defaultValue?: unknown;
}

/**
 * A variable definition for GraphQL operations.
 *
 * @example
 * ```tsx
 * <>
 *   <VariableDefinition name="id" type="ID!" />
 *   <VariableDefinition name="limit" type="Int" defaultValue={10} />
 *   <VariableDefinition name="includeDeleted" type="Boolean" defaultValue={false} />
 * </>
 * ```
 * renders to
 * ```graphql
 * $id: ID!, $limit: Int = 10, $includeDeleted: Boolean = false
 * ```
 */
export function VariableDefinition(props: VariableDefinitionProps) {
  // Validate that the variable type is valid for input positions
  validateInputType(props.type, props.name, "Variable");

  // Validate that non-null types don't have null default values
  if (props.defaultValue !== undefined) {
    validateNonNullDefault(
      props.type,
      props.defaultValue,
      props.name,
      "Variable",
    );
  }

  // Create a symbol for uniqueness validation
  const sym = createGraphQLSymbol(
    props.name,
    {
      metadata: {
        type: props.type,
      },
    },
    "variable",
  );

  const TypeSymbolSlot = createSymbolSlot();

  const typeAnnotation = memo(() => (
    <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
  ));

  const hasDefaultValue = props.defaultValue !== undefined;

  return (
    <CoreDeclaration symbol={sym}>
      ${props.name}: {typeAnnotation}
      <Show when={hasDefaultValue}>
        {" = "}
        <ValueExpression jsValue={props.defaultValue} />
      </Show>
    </CoreDeclaration>
  );
}
