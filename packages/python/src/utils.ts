import { defaultProps, splitProps } from "@alloy-js/core";
import { CallSignatureProps, SingleTypeExpression, SingleTypeExpressionProps, UnionTypeExpression, UnionTypeExpressionProps } from "./components/index.js";

/**
 * Extract only the call signature props from a props object which extends
 * `CallSignatureProps`. You can provide default values for the props.
 */
export function getCallSignatureProps(
  props: CallSignatureProps,
  defaults?: Partial<CallSignatureProps>,
) {
  const [callSignatureProps] = splitProps(props, [
    "parameters",
    "typeParameters",
    "args",
    "kwargs",
    "instanceFunction",
    "classFunction",
    "returnType",
  ]);

  if (!defaults) {
    return callSignatureProps;
  }

  return defaultProps(callSignatureProps, defaults);
}

export function resolveTypeExpression(type: SingleTypeExpressionProps | UnionTypeExpressionProps) {
  if (Array.isArray(type.children)) {
    return UnionTypeExpression(type as UnionTypeExpressionProps);
  } else {
    return SingleTypeExpression(type as SingleTypeExpressionProps);
  }
}