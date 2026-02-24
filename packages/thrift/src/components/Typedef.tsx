import { Children, Declaration, Name, Refkey } from "@alloy-js/core";
import { renderAnnotations, renderTypeRef } from "../render.js";
import { createTypeSymbol } from "../symbols/factories.js";
import type { AnnotationMap, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface TypedefProps {
  name: string;
  type: TypeRef;
  refkey?: Refkey;
  annotations?: AnnotationMap;
  doc?: Children;
}

/**
 * Define a Thrift type alias.
 *
 * @remarks
 * Useful for giving semantic names to primitive or container types.
 *
 * @example Typedef
 * ```tsx
 * <Typedef name="UserId" type="i64" />
 * ```
 */
export function Typedef(props: TypedefProps) {
  const symbol = createTypeSymbol(props.name, props.refkey);
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        typedef {renderTypeRef(props.type)} <Name />
        {annotationText}
      </Declaration>
    </>
  );
}
