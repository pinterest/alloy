import { Children } from "@alloy-js/core";
import { ValueExpression } from "./ValueExpression.js";

export interface ArgumentProps {
  /**
   * The name of the argument
   */
  name: string;
  /**
   * The value for the argument (can be a literal, variable, or enum value)
   */
  value: Children | string | number | boolean | null;
}

/**
 * An argument in a field selection.
 *
 * @example
 * ```tsx
 * // Literal values
 * <Argument name="id" value="123" />
 * <Argument name="limit" value={10} />
 * <Argument name="includeDeleted" value={false} />
 *
 * // Variable reference
 * <Argument name="id" value={<Variable name="userId" />} />
 *
 * // Enum value
 * <Argument name="status" value={code`${statusEnumValue}`} />
 * ```
 * renders to
 * ```graphql
 * id: "123", limit: 10, includeDeleted: false, id: $userId, status: ACTIVE
 * ```
 */
export function Argument(props: ArgumentProps) {
  const isChildren =
    typeof props.value === "function" ||
    (typeof props.value === "object" &&
      props.value !== null &&
      !Array.isArray(props.value));

  return (
    <>
      {props.name}:{" "}
      {isChildren ? props.value : <ValueExpression jsValue={props.value} />}
    </>
  );
}
