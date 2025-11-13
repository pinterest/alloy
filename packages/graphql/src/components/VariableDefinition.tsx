import { Children, Show, createSymbolSlot, memo } from "@alloy-js/core";
import { ValueExpression } from "./ValueExpression.js";

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
  const TypeSymbolSlot = createSymbolSlot();

  const typeAnnotation = memo(() => (
    <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
  ));

  const hasDefaultValue = props.defaultValue !== undefined;

  return (
    <>
      ${props.name}: {typeAnnotation}
      <Show when={hasDefaultValue}>
        {" = "}
        <ValueExpression jsValue={props.defaultValue} />
      </Show>
    </>
  );
}
