import { For, Indent, isRefkey, memo } from "@alloy-js/core";

export interface ValueExpressionProps {
  jsValue?: unknown;
}

/**
 * A component that renders a JavaScript value as a GraphQL value.
 * It handles various types of values including numbers, booleans, strings,
 * arrays (lists), objects (input objects), and refkeys (e.g., for enum values).
 *
 * @example
 * ```tsx
 * <ValueExpression jsValue={42} /> // renders: 42
 * <ValueExpression jsValue={true} /> // renders: true
 * <ValueExpression jsValue="Hello" /> // renders: "Hello"
 * <ValueExpression jsValue={[1, 2, 3]} /> // renders: [1, 2, 3]
 * <ValueExpression jsValue={{ key: "value" }} /> // renders: {key: "value"}
 * <ValueExpression jsValue={code`${enumValueRef}`} /> // renders: ENUM_VALUE (via refkey)
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
        // Check if array contains non-primitives (code templates with refkeys)
        // Code templates contain objects with 'key' property (refkeys) or functions
        const hasNonPrimitive = jsValue.some(
          (v) =>
            typeof v === "function" ||
            (typeof v === "object" && v !== null && "key" in v),
        );
        if (hasNonPrimitive) {
          // This is a code template or contains refkeys, render as-is
          return jsValue;
        }
        // Regular array of primitives - render as GraphQL list
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
        // Check if object contains non-primitives
        // Code templates contain objects with 'key' property (refkeys) or functions
        const hasNonPrimitive = Object.values(jsValue).some(
          (v) =>
            typeof v === "function" ||
            (typeof v === "object" && v !== null && "key" in v),
        );
        if (hasNonPrimitive) {
          // This object contains refkeys or code templates, render as-is
          return jsValue;
        }
        // Regular object - render as GraphQL input object
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
