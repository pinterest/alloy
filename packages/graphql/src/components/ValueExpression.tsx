import { For, Indent, isRefkey, memo } from "@alloy-js/core";

export interface ValueExpressionProps {
  jsValue?: unknown;
}

/**
 * A component that renders a JavaScript value as a GraphQL value.
 * It handles various types of values including numbers, booleans, strings,
 * arrays (lists), and objects (input objects), converting them to GraphQL syntax.
 *
 * @example
 * ```tsx
 * <ValueExpression jsValue={42} /> // renders "42"
 * <ValueExpression jsValue={true} /> // renders "true"
 * <ValueExpression jsValue="Hello" /> // renders '"Hello"'
 * <ValueExpression jsValue={[1, 2, 3]} /> // renders "[1, 2, 3]"
 * <ValueExpression jsValue={{ key: "value" }} /> // renders '{key: "value"}'
 * ```
 */
export function ValueExpression(props: ValueExpressionProps): any {
  return memo(() => {
    const jsValue = props.jsValue;

    if (typeof jsValue === "undefined" || jsValue === null) {
      return "null";
    } else if (typeof jsValue === "number") {
      return String(jsValue);
    } else if (typeof jsValue === "boolean") {
      return jsValue ? "true" : "false";
    } else if (typeof jsValue === "string") {
      // Escape quotes in strings
      return `"${jsValue.replace(/"/g, '\\"')}"`;
    } else if (typeof jsValue === "function") {
      // functions are inserted as-is (handles refkeys and other Children)
      return jsValue;
    } else if (isRefkey(jsValue)) {
      // Refkeys are rendered as-is (they resolve to symbol names)
      return jsValue;
    } else if (typeof jsValue === "object") {
      if (Array.isArray(jsValue)) {
        return (
          <group>
            {"["}
            <Indent softline trailingBreak>
              <For each={jsValue} comma line>
                {(v) => <ValueExpression jsValue={v} />}
              </For>
            </Indent>
            {"]"}
          </group>
        );
      } else {
        const entries = Object.entries(jsValue);
        if (entries.length === 0) {
          return "{}";
        }
        return (
          <group>
            {"{"}
            <Indent softline>
              <For each={entries} comma line>
                {([k, v]) => (
                  <>
                    {k}: <ValueExpression jsValue={v} />
                  </>
                )}
              </For>
            </Indent>
            {"}"}
          </group>
        );
      }
    }
  });
}
