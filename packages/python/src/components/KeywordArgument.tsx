import { Children, isNamekey, memo, Namekey } from "@alloy-js/core";
import { usePythonNamePolicy } from "../name-policy.js";
import { Atom } from "./Atom.jsx";

export interface KeywordArgumentProps {
  /**
   * The name of the keyword argument. Can be a string or a Namekey.
   * Using a Namekey is useful when you want to match a function parameter's name.
   */
  name: string | Namekey;
  /**
   * The value of the keyword argument.
   */
  value: Children;
}

/**
 * A keyword argument component for Python function calls.
 *
 * This renders keyword arguments like `name=value` in function calls.
 * Unlike VariableDeclaration, this does not create a symbol or register
 * in any scope.
 *
 * @example
 * ```tsx
 * <FunctionCallExpression
 *   target="my_func"
 *   args={[
 *     <KeywordArgument name="foo" value={42} />,
 *     <KeywordArgument name="bar" value="hello" />,
 *   ]}
 * />
 * ```
 * renders to
 * ```py
 * my_func(foo=42, bar="hello")
 * ```
 */
export function KeywordArgument(props: KeywordArgumentProps) {
  const namePolicy = usePythonNamePolicy();
  const rawName = isNamekey(props.name) ? props.name.name : props.name;
  const name = namePolicy.getName(rawName, "variable");

  const value =
    typeof props.value === "object" ? memo(() => props.value) : props.value;

  return (
    <>
      {name}=<Atom jsValue={value} />
    </>
  );
}
