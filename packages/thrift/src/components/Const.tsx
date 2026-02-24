import { Children, Declaration, Name, Refkey } from "@alloy-js/core";
import {
  renderAnnotations,
  renderConstValue,
  renderTypeRef,
} from "../render.js";
import { createConstSymbol } from "../symbols/factories.js";
import type { AnnotationMap, ConstValue, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface ConstProps {
  name: string;
  type: TypeRef;
  value: ConstValue;
  refkey?: Refkey;
  annotations?: AnnotationMap;
  doc?: Children;
}

/**
 * Define a Thrift constant.
 *
 * @remarks
 * Values can be literals, lists, or maps. Use `ConstValue` helpers for complex
 * values.
 *
 * @example Constant value
 * ```tsx
 * <Const name="DefaultPageSize" type="i32" value={50} />
 * ```
 */
export function Const(props: ConstProps) {
  const symbol = createConstSymbol(props.name, props.refkey);
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        const {renderTypeRef(props.type)} <Name /> ={" "}
        {renderConstValue(props.value)}
        {annotationText}
      </Declaration>
    </>
  );
}
