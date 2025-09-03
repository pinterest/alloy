import { defaultProps, splitProps } from "@alloy-js/core";
import {
  CallSignatureProps,
  SingleTypeExpression,
  SingleTypeExpressionProps,
  UnionTypeExpression,
  UnionTypeExpressionProps,
} from "./components/index.js";

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

export function resolveTypeExpression(
  typeProps: SingleTypeExpressionProps | UnionTypeExpressionProps,
) {
  // The issue: this function was incorrectly treating code template arrays as union types.
  // UnionTypeExpression expects children: SingleTypeExpressionProps[] 
  // (array of objects with children property)
  // SingleTypeExpression with code template has children: Children 
  // (can be array of mixed types from template literal)
  
  if (Array.isArray(typeProps.children)) {
    // Check if this is a true union type by seeing if first element has children property
    const firstChild = typeProps.children[0];
    const isUnionType = firstChild && 
      typeof firstChild === 'object' && 
      firstChild !== null && 
      'children' in firstChild;
      
    if (isUnionType) {
      return UnionTypeExpression(typeProps as UnionTypeExpressionProps);
    }
  }
  
  return SingleTypeExpression(typeProps as SingleTypeExpressionProps);
}
